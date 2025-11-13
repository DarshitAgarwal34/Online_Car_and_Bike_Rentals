// src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateJWT } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/requireRole');

// Public: create first admin or let signup be protected in production
router.post('/signup', adminController.signup);

// Public login endpoint for admins
router.post('/login', adminController.login);

// Protected admin endpoints (require JWT + admin role)
router.get('/', authenticateJWT, requireRole('admin'), adminController.listAdminsHandler);
router.get('/:id', authenticateJWT, requireRole('admin'), adminController.getAdminProfile);
router.patch('/:id/activate', authenticateJWT, requireRole('admin'), adminController.setActiveHandler);
router.patch('/:id', authenticateJWT, requireRole('admin'), adminController.updateAdminHandler);

module.exports = router;
