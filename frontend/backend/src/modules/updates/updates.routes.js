const express = require('express');
const router = express.Router();
const updatesController = require('./updates.controller');
const authMiddleware = require('@middlewares/auth.middleware');

// Apply auth middleware to all updates routes
router.use(authMiddleware);

/**
 * POST /api/updates
 * Create a new update
 */
router.post('/', (req, res, next) => updatesController.createUpdate(req, res, next));

/**
 * GET /api/updates/my
 * Get updates created by the current user
 */
router.get('/my', (req, res, next) => updatesController.getMyUpdates(req, res, next));

/**
 * GET /api/updates/visible
 * Get updates visible to the current user
 */
router.get('/visible', (req, res, next) => updatesController.getVisibleUpdates(req, res, next));

/**
 * Analytics Endpoints (Read-Only)
 */
router.get('/analytics/me', (req, res, next) => updatesController.getAnalyticsMe(req, res, next));
router.get('/analytics/team', (req, res, next) => updatesController.getAnalyticsTeam(req, res, next));
router.get('/analytics/org', (req, res, next) => updatesController.getAnalyticsOrg(req, res, next));

/**
 * Intelligence & Automation (Phase-5)
 */
router.get('/intelligence/summary', (req, res, next) => updatesController.getIntelligenceSummary(req, res, next));
router.post('/automation/reminders', (req, res, next) => updatesController.runReminders(req, res, next));
router.get('/governance/export', (req, res, next) => updatesController.exportReport(req, res, next));

/**
 * PUT /api/updates/:id
 * Update an existing update
 */
router.put('/:id', (req, res, next) => updatesController.updateUpdate(req, res, next));

/**
 * DELETE /api/updates/:id
 * Delete an update
 */
router.delete('/:id', (req, res, next) => updatesController.deleteUpdate(req, res, next));

/**
 * POST /api/updates/:id/feedback
 * Add feedback to an update
 */
router.post('/:id/feedback', (req, res, next) => updatesController.addFeedback(req, res, next));

module.exports = router;
