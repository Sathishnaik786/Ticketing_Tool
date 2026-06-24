const express = require('express');
const router = express.Router();
const analyticsController = require('./analytics.controller');
const requireRole = require('@middlewares/role.middleware');

// Apply auth middleware to all routes in this file
const authMiddleware = require('@middlewares/auth.middleware');
router.use(authMiddleware);

// Admin analytics routes
router.get('/admin/overview', requireRole('ADMIN'), analyticsController.getAdminOverview);

// Manager analytics routes
router.get('/manager/team-progress', requireRole('MANAGER'), analyticsController.getManagerTeamProgress);

// HR analytics routes
router.get('/hr/workforce', requireRole('HR'), analyticsController.getHRWorkforce);

// Employee analytics routes (self)
router.get('/employee/self', requireRole('EMPLOYEE', 'HR', 'MANAGER', 'ADMIN'), analyticsController.getEmployeeSelf);

module.exports = router;