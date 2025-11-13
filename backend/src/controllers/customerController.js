// backend/src/controllers/customerController.js
// Purpose: Customer-related controller handlers (signup, login, profile, kyc)
// - Accepts both JSON and multipart/form-data (req.file handled by multer middleware if present)
// - Returns token + user on successful signup/login for frontend auto-login
// - Uses bcrypt for password hashing and jsonwebtoken for JWTs

// Import required modules
const bcrypt = require('bcrypt'); // password hashing
const jwt = require('jsonwebtoken'); // JWT generation
const { pool } = require('../db/connection'); // mysql2 pool exported from db/connection
const path = require('path'); // path utilities
const fs = require('fs'); // fs to optionally remove files on errors

// Load environment variables (e.g. JWT secret, token expiry)
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'; // fallback secret for dev
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'; // token lifetime

// Helper: create a JWT token for a user object (minimally includes id, email, role)
function createToken(user) {
  // sign a token containing user id, email and role; use secret and expiry
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role || 'customer' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Helper: hash a plaintext password using bcrypt
async function hashPassword(password) {
  // use salt rounds 10 for reasonable security/performance
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

// Helper: compare plaintext password with hashed password
async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

// Controller: signup (customer)
// Accepts JSON body or multipart/form-data (if you use multer to parse file)
// Expected fields: name, email, password (required), phone,dob,gender optional
// Optional file field (multipart) : profile_picture
async function signup(req, res) {
  try {
    // Extract fields from req.body (works for both JSON and multipart/form-data)
    const { name, email, password, phone, dob, gender } = req.body || {};

    // Basic validation: require name, email, password
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'missing_required_fields', message: 'name, email and password are required' });
    }

    // Ensure email uniqueness (case-insensitive)
    const [existingByEmail] = await pool.query('SELECT id FROM customers WHERE LOWER(email) = LOWER(?) LIMIT 1', [email]);
    if (existingByEmail && existingByEmail.length > 0) {
      return res.status(409).json({ error: 'email_exists', message: 'An account with this email already exists' });
    }

    // If phone provided, check uniqueness of phone too
    if (phone) {
      const [existingByPhone] = await pool.query('SELECT id FROM customers WHERE phone = ? LIMIT 1', [phone]);
      if (existingByPhone && existingByPhone.length > 0) {
        return res.status(409).json({ error: 'phone_exists', message: 'An account with this phone already exists' });
      }
    }

    // If profile image uploaded via multer, req.file will be present
    let profile_picture = null;
    if (req.file && req.file.filename) {
      // store public relative path to served uploads; depends on how you serve /public
      profile_picture = `/uploads/${req.file.filename}`;
    }

    // Hash password before storing
    const hashed = await hashPassword(password);

    // Insert new customer into DB - use parameterized query to prevent SQL injection
    const insertSql = `
      INSERT INTO customers
        (name, email, password, phone, dob, gender, profile_picture, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    const params = [
      name,
      email,
      hashed,
      phone || null,
      dob || null,
      gender || null,
      profile_picture
    ];

    // Execute insert
    const [result] = await pool.query(insertSql, params);

    // Build user object to return (do not include password)
    const user = {
      id: result.insertId,
      name,
      email,
      phone: phone || null,
      dob: dob || null,
      gender: gender || null,
      profile_picture: profile_picture || null,
      role: 'customer'
    };

    // Create a JWT token for the new user
    const token = createToken(user);

    // Respond with token and basic user object so frontend can auto-login
    return res.status(201).json({ token, user });
  } catch (err) {
    // If an uploaded file exists and we encountered an error, consider removing the file to avoid orphan files
    if (req.file && req.file.path) {
      // Attempt to remove uploaded file (best-effort)
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) console.warn('Failed to remove uploaded file after signup error', unlinkErr);
      });
    }

    // Log and return generic error (include detail for debugging in dev)
    console.error('customer signup error:', err);
    return res.status(500).json({ error: 'internal_server_error', detail: err.message });
  }
}

// Controller: login (customer)
// Accepts JSON body: { email } + { password } OR { phone } + { password }
// Returns token + user on success
async function login(req, res) {
  try {
    // Extract credentials from body
    const { email, phone, password } = req.body || {};

    // Validate presence
    if ((!email && !phone) || !password) {
      return res.status(400).json({ error: 'missing_credentials', message: 'Provide email or phone and password' });
    }

    // Build query depending on whether email or phone is provided
    let sql = 'SELECT id, name, email, password, phone, dob, gender, profile_picture FROM customers WHERE ';
    let params = [];

    if (email) {
      sql += 'LOWER(email) = LOWER(?) LIMIT 1';
      params = [email];
    } else {
      sql += 'phone = ? LIMIT 1';
      params = [phone];
    }

    // Execute DB lookup
    const [rows] = await pool.query(sql, params);

    // If no user found
    if (!rows || rows.length === 0) {
      return res.status(401).json({ error: 'invalid_credentials', message: 'Invalid email/phone or password' });
    }

    // User found - compare password
    const userRow = rows[0];

    // Compare hashed password
    const ok = await comparePassword(password, userRow.password);
    if (!ok) {
      return res.status(401).json({ error: 'invalid_credentials', message: 'Invalid email/phone or password' });
    }

    // Build user object to return (omit password)
    const user = {
      id: userRow.id,
      name: userRow.name,
      email: userRow.email,
      phone: userRow.phone,
      dob: userRow.dob,
      gender: userRow.gender,
      profile_picture: userRow.profile_picture,
      role: 'customer'
    };

    // Create token
    const token = createToken(user);

    // Respond with token and user
    return res.json({ token, user });
  } catch (err) {
    console.error('customer login error:', err);
    return res.status(500).json({ error: 'internal_server_error', detail: err.message });
  }
}

// Controller: getProfile
// Returns details for a given customer id (used by frontend to populate profile)
async function getProfile(req, res) {
  try {
    // Expect id via params (e.g., /api/customers/:id) or from authenticated token (req.user set by middleware)
    const id = Number(req.params.id || (req.user && req.user.id));
    if (!id) return res.status(400).json({ error: 'invalid_id' });

    // Query DB
    const [rows] = await pool.query('SELECT id, name, email, phone, dob, gender, profile_picture, is_verified, wallet_balance, created_at FROM customers WHERE id = ? LIMIT 1', [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'not_found' });

    // Return the customer row
    return res.json({ customer: rows[0] });
  } catch (err) {
    console.error('getProfile error:', err);
    return res.status(500).json({ error: 'internal_server_error', detail: err.message });
  }
}

// Controller: uploadKyc - attach aadhar/license records for a customer
// Expects req.file(s) handled by multer (e.g., fields: aadhar_file, license_file) OR aadhar_number, license_number in body
async function uploadKyc(req, res) {
  try {
    // Use authenticated user id if available, otherwise require customer_id in body
    const customerId = Number(req.user && req.user.id) || Number(req.body.customer_id);
    if (!customerId) return res.status(400).json({ error: 'missing_customer_id' });

    // Extract numbers and files
    const { aadhar_number, license_number } = req.body || {};
    const aadharFile = req.files && req.files['aadhar_file'] ? req.files['aadhar_file'][0] : null;
    const licenseFile = req.files && req.files['license_file'] ? req.files['license_file'][0] : null;

    // Insert KYC documents into kyc_docs table (or customers table fields depending on your schema)
    // Here we insert to kyc_docs for normalization (adjust if your DB differs)
    const inserts = [];

    if (aadhar_number || aadharFile) {
      const docUrl = aadharFile ? `/uploads/${aadharFile.filename}` : null;
      inserts.push(['aadhar', aadhar_number || null, docUrl, customerId]);
    }

    if (license_number || licenseFile) {
      const docUrl = licenseFile ? `/uploads/${licenseFile.filename}` : null;
      inserts.push(['driving_license', license_number || null, docUrl, customerId]);
    }

    // If nothing provided, return bad request
    if (inserts.length === 0) {
      return res.status(400).json({ error: 'nothing_to_upload', message: 'Provide aadhar/license number or files' });
    }

    // Insert each doc row
    for (const it of inserts) {
      const [doc_type, doc_number, doc_url, cId] = it;
      await pool.query(
        `INSERT INTO kyc_docs (customer_id, doc_type, doc_number, doc_url, verified, created_at, updated_at)
         VALUES (?, ?, ?, ?, 0, NOW(), NOW())`,
        [cId, doc_type, doc_number, doc_url]
      );
    }

    // Optionally mark customer as pending verification; leave is_verified false
    return res.json({ message: 'kyc_uploaded' });
  } catch (err) {
    console.error('uploadKyc error:', err);
    return res.status(500).json({ error: 'internal_server_error', detail: err.message });
  }
}

// Controller: updateProfile (partial update)
// Allows changing name, phone, dob, gender, and profile_picture (if req.file provided)
async function updateProfile(req, res) {
  try {
    // Authenticated user id or param
    const customerId = Number(req.user && req.user.id) || Number(req.params.id);
    if (!customerId) return res.status(400).json({ error: 'invalid_id' });

    // Collect updatable fields from body
    const { name, phone, dob, gender } = req.body || {};

    // If file present, set profile_picture
    let profile_picture = null;
    if (req.file && req.file.filename) {
      profile_picture = `/uploads/${req.file.filename}`;
    }

    // Build dynamic update query
    const fields = [];
    const params = [];

    if (name !== undefined) { fields.push('name = ?'); params.push(name); }
    if (phone !== undefined) { fields.push('phone = ?'); params.push(phone); }
    if (dob !== undefined) { fields.push('dob = ?'); params.push(dob); }
    if (gender !== undefined) { fields.push('gender = ?'); params.push(gender); }
    if (profile_picture !== null) { fields.push('profile_picture = ?'); params.push(profile_picture); }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'no_updates_provided' });
    }

    // Add updated_at and where
    params.push(customerId);
    const sql = `UPDATE customers SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
    const [result] = await pool.query(sql, params);

    if (result.affectedRows === 0) return res.status(404).json({ error: 'not_found' });

    return res.json({ message: 'profile_updated' });
  } catch (err) {
    console.error('updateProfile error:', err);
    return res.status(500).json({ error: 'internal_server_error', detail: err.message });
  }
}

// Export controllers
module.exports = {
  signup,
  login,
  getProfile,
  uploadKyc,
  updateProfile
};
