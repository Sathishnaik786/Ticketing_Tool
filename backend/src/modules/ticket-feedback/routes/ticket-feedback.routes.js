const express = require('express');
const authMiddleware = require('../../../middlewares/auth.middleware');
const ticketFeedbackFeatureFlag = require('../middleware/ticket-feedback-feature-flag.middleware');
const ticketFeedbackController = require('../controllers/ticket-feedback.controller');

const router = express.Router();

router.use(ticketFeedbackFeatureFlag);
router.use(authMiddleware);

router.post('/', (req, res, next) => ticketFeedbackController.submitFeedback(req, res, next));
router.get('/metrics', (req, res, next) => ticketFeedbackController.getMetrics(req, res, next));
router.get('/my-count', (req, res, next) => ticketFeedbackController.getMySubmissionCount(req, res, next));
router.get('/ticket/:ticketId', (req, res, next) => ticketFeedbackController.getFeedbackByTicket(req, res, next));

module.exports = router;
