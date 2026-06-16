const express = require('express');
const authMiddleware = require('../../middlewares/auth.middleware');
const ticketAssignmentFeatureFlag = require('./middleware/ticket-assignment-feature-flag.middleware');
const ticketAssignmentController = require('./ticket-assignment.controller');

const router = express.Router();

router.use(ticketAssignmentFeatureFlag);
router.use(authMiddleware);

router.post('/', (req, res, next) => ticketAssignmentController.assignTicket(req, res, next));
router.get('/my-queue', (req, res, next) => ticketAssignmentController.getMyQueue(req, res, next));
router.get('/team-queue', (req, res, next) => ticketAssignmentController.getTeamQueue(req, res, next));
router.get('/unassigned', (req, res, next) => ticketAssignmentController.getUnassigned(req, res, next));
router.get('/analytics', (req, res, next) => ticketAssignmentController.getAnalytics(req, res, next));
router.get('/history/:ticketId', (req, res, next) => ticketAssignmentController.getTicketHistory(req, res, next));
router.put('/:ticketId/reassign', (req, res, next) => ticketAssignmentController.reassignTicket(req, res, next));

module.exports = router;
