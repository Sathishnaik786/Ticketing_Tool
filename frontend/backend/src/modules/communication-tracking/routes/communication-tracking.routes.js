const express = require('express');
const authMiddleware = require('@middlewares/auth.middleware');
const communicationTrackingFeatureFlag = require('../middleware/communication-tracking-feature-flag.middleware');
const communicationTrackingController = require('../controllers/communication-tracking.controller');

const router = express.Router();

router.use(communicationTrackingFeatureFlag);
router.use(authMiddleware);

router.post('/comment', (req, res, next) => communicationTrackingController.addComment(req, res, next));
router.post('/chat', (req, res, next) => communicationTrackingController.addChat(req, res, next));
router.post('/email', (req, res, next) => communicationTrackingController.logEmail(req, res, next));
router.post('/call-log', (req, res, next) => communicationTrackingController.logCall(req, res, next));
router.post('/internal-note', (req, res, next) => communicationTrackingController.addInternalNote(req, res, next));
router.get('/ticket/:ticketId', (req, res, next) => communicationTrackingController.getTicketCommunications(req, res, next));
router.get('/timeline/:ticketId', (req, res, next) => communicationTrackingController.getTicketTimeline(req, res, next));
router.get('/analytics', (req, res, next) => communicationTrackingController.getAnalytics(req, res, next));
router.get('/dashboard-summary', (req, res, next) => communicationTrackingController.getDashboardSummary(req, res, next));

module.exports = router;
