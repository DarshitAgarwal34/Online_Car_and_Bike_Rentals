// src/controllers/customerController.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
  createCustomer,
  getCustomerByEmail,
  getCustomerById
} = require('../models/customerModel');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Add these requires at top of customerController if not present
const { updateCustomerAadhar } = require('../models/customerModel'); // we already have this model helper
const { pool } = require('../db/connection');

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// POST /api/customers/signup
async function signup(req, res) {
  try {
    const { name, email, password, phone, dob, age, gender, profile_picture, license_number, aadhar_plain } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'name, email and password are required' });

    const existing = await getCustomerByEmail(email);
    if (existing) return res.status(409).json({ error: 'email already registered' });

    const result = await createCustomer({
      name,
      email,
      password,
      phone,
      dob,
      age,
      gender,
      profile_picture,
      license_number,
      aadhar_plain,
      is_verified: false
    });

    // Fetch created user (sanitized)
    const user = await getCustomerById(result.id);
    // add explicit role for frontend
    user.role = 'customer';                 
    delete user.password;
    user.aadhar_plain = undefined;
    // create JWT payload (snapshot)
    const token = signToken({ sub: user.id, role: 'customer', email: user.email });
    return res.status(201).json({ id: result.id, token, user });

  } catch (err) {
    console.error('signup error', err);
    return res.status(500).json({ error: 'internal_server_error' });
  }
}

// POST /api/customers/login
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const { pool } = require('../db/connection');
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query('SELECT * FROM customers WHERE email = ? LIMIT 1', [email]);
      if (!rows || rows.length === 0) return res.status(401).json({ error: 'invalid credentials' });
      const row = rows[0];

      const match = await bcrypt.compare(String(password), row.password);
      if (!match) return res.status(401).json({ error: 'invalid credentials' });

      const user = await getCustomerByEmail(email);
      user.role = 'customer';
      delete user.password;
      user.aadhar_plain = undefined;
      const token = signToken({ sub: user.id, role: 'customer', email: user.email });
      return res.json({ token, user });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('login error', err);
    return res.status(500).json({ error: 'internal_server_error' });
  }
}

// GET /api/customers/:id
async function getProfile(req, res) {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'invalid id' });
    const user = await getCustomerById(id);
    if (!user) return res.status(404).json({ error: 'not_found' });
    delete user.password;
    user.aadhar_plain = undefined;
    return res.json({ user });
  } catch (err) {
    console.error('getProfile error', err);
    return res.status(500).json({ error: 'internal_server_error' });
  }
}

// POST /api/customers/:id/kyc
// Body: { license_number, aadhar_plain, doc_type }  (doc_type optional: 'aadhar' or 'license')
async function uploadKyc(req, res) {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'invalid id' });

    const { license_number, aadhar_plain, doc_type } = req.body;
    if (!license_number && !aadhar_plain) return res.status(400).json({ error: 'license_number or aadhar_plain required' });

    // If aadhar provided, encrypt & store in customers.aadhar_cipher
    if (aadhar_plain) {
      const ok = await updateCustomerAadhar(id, aadhar_plain);
      if (!ok) return res.status(500).json({ error: 'failed_to_update_aadhar' });
    }

    // update customers.license_number if provided
    if (license_number) {
      const conn = await pool.getConnection();
      try {
        await conn.query('UPDATE customers SET license_number = ? WHERE id = ?', [license_number, id]);
      } finally {
        conn.release();
      }
    }

    // Insert a kyc_docs record(s) for traceability
    const conn2 = await pool.getConnection();
    try {
      if (license_number) {
        await conn2.query(
          'INSERT INTO kyc_docs (customer_id, doc_type, doc_number, doc_url, verified) VALUES (?, ?, ?, NULL, 0)',
          [id, 'driving_license', license_number]
        );
      }
      if (aadhar_plain) {
        // store only masked doc_number in record (do NOT store full plain aadhar). We'll store masked for search.
        const masked = String(aadhar_plain).slice(-4).padStart(String(aadhar_plain).length, '*');
        await conn2.query(
          'INSERT INTO kyc_docs (customer_id, doc_type, doc_number, doc_url, verified) VALUES (?, ?, ?, NULL, 0)',
          [id, 'aadhar', masked]
        );
      }
    } finally {
      conn2.release();
    }

    return res.json({ message: 'kyc_uploaded' });
  } catch (err) {
    console.error('uploadKyc error', err);
    return res.status(500).json({ error: 'internal_server_error' });
  }
}

module.exports = {
  signup,
  login,
  getProfile,
  uploadKyc
};
