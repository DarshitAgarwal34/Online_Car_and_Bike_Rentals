// src/routes/ownerRoutes.js
const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');

// POST /api/owners/signup
router.post('/signup', ownerController.signup);

// POST /api/owners/login
router.post('/login', ownerController.login);

module.exports = router;
