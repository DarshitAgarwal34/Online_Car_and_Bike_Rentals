// src/controllers/ownerController.js
// Owner signup / login controller (issues JWTs similarly to customer controller)

require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createOwner, getOwnerByEmail, getOwnerById } = require('../models/ownerModel');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// POST /api/owners/signup
// Expects: { name, email, password, phone, dob, age, gender, profile_picture }
async function signup(req, res) {
  try {
    const { name, email, password, phone, dob, age, gender, profile_picture } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'name, email and password are required' });

    const existing = await getOwnerByEmail(email);
    if (existing) return res.status(409).json({ error: 'email already registered' });

    const result = await createOwner({
      name, email, password, phone, dob, age, gender, profile_picture
    });

    const user = await getOwnerById(result.id);
    delete user.password;
    const token = signToken({ sub: user.id, role: 'owner', email: user.email });

    return res.status(201).json({ id: result.id, token, user });
  } catch (err) {
    console.error('owner signup error', err);
    return res.status(500).json({ error: 'internal_server_error' });
  }
}

// POST /api/owners/login
// Expects: { email, password }
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    // raw query to get password hash
    const { pool } = require('../db/connection');
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query('SELECT * FROM owners WHERE email = ? LIMIT 1', [email]);
      if (!rows || rows.length === 0) return res.status(401).json({ error: 'invalid credentials' });
      const row = rows[0];
      const match = await bcrypt.compare(String(password), row.password);
      if (!match) return res.status(401).json({ error: 'invalid credentials' });
    } finally {
      conn.release();
    }

    const user = await getOwnerByEmail(email);
    delete user.password;
    const token = signToken({ sub: user.id, role: 'owner', email: user.email });

    return res.json({ token, user });
  } catch (err) {
    console.error('owner login error', err);
    return res.status(500).json({ error: 'internal_server_error' });
  }
}

module.exports = { signup, login };
