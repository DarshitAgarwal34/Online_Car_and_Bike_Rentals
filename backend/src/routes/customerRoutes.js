// File: src/routes/customerRoutes.js
const express = require('express');
const router = express.Router();

const customerController = require('../controllers/customerController');

// POST /api/customers/signup
router.post('/signup', customerController.signup);

// POST /api/customers/login
router.post('/login', customerController.login);

// GET /api/customers/:id
const auth = require('../middlewares/authMiddleware');
router.get('/:id', auth.authenticateJWT, customerController.getProfile);

// POST /api/customers/:id/kyc
router.post('/:id/kyc', customerController.uploadKyc);


module.exports = router;
