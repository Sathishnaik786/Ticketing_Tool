const express = require('express');
const router = express.Router();
const authController = require('@controllers/auth.controller');
const authMiddleware = require('@middlewares/auth.middleware');
const requireRole = require('@middlewares/role.middleware');

router.post('/login', authController.login); // Add the login endpoint
router.post('/check-email', authController.checkEmailExists);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/me', authMiddleware, authController.getMe); // Add the /me endpoint
router.post('/admin/users', authMiddleware, requireRole('ADMIN'), authController.createUser);

module.exports = router;
