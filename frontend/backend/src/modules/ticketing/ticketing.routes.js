const express = require('express');
const authMiddleware = require('@middlewares/auth.middleware');
const ticketingFeatureFlag = require('./middleware/ticketing-feature-flag.middleware');
const { uploadAttachment, handleUploadError } = require('./middleware/upload.middleware');
const TicketingController = require('./ticketing.controller');

const ticketingController = new TicketingController();

const router = express.Router();

router.use(ticketingFeatureFlag);
router.use(authMiddleware);

// Tickets
router.post('/', (req, res, next) => ticketingController.createTicket(req, res, next));
router.get('/', (req, res, next) => ticketingController.listTickets(req, res, next));
router.get('/:ticketId', (req, res, next) => ticketingController.getTicketById(req, res, next));
router.patch('/:ticketId', (req, res, next) => ticketingController.updateTicket(req, res, next));
router.patch('/:ticketId/status', (req, res, next) => ticketingController.changeStatus(req, res, next));
router.patch('/:ticketId/close', (req, res, next) => ticketingController.closeTicket(req, res, next));
router.patch('/:ticketId/reopen', (req, res, next) => ticketingController.reopenTicket(req, res, next));

// Comments
router.post('/:ticketId/comments', (req, res, next) => ticketingController.createComment(req, res, next));
router.get('/:ticketId/comments', (req, res, next) => ticketingController.listComments(req, res, next));

// Attachments
router.post(
  '/:ticketId/attachments',
  uploadAttachment,
  handleUploadError,
  (req, res, next) => ticketingController.createAttachment(req, res, next)
);
router.get('/:ticketId/attachments', (req, res, next) => ticketingController.listAttachments(req, res, next));
router.get(
  '/:ticketId/attachments/:attachmentId/url',
  (req, res, next) => ticketingController.getSignedUrl(req, res, next)
);

// Assignments
router.post('/:ticketId/assign', (req, res, next) => ticketingController.assignTicket(req, res, next));
router.post('/:ticketId/reassign', (req, res, next) => ticketingController.reassignTicket(req, res, next));
router.get('/:ticketId/assignments', (req, res, next) => ticketingController.getAssignmentHistory(req, res, next));

// Watchers
router.post('/:ticketId/watchers', (req, res, next) => ticketingController.addWatcher(req, res, next));
router.get('/:ticketId/watchers', (req, res, next) => ticketingController.listWatchers(req, res, next));
router.delete(
  '/:ticketId/watchers/:employeeId',
  (req, res, next) => ticketingController.removeWatcher(req, res, next)
);

// Timeline & SLA
router.get('/:ticketId/timeline', (req, res, next) => ticketingController.getTimeline(req, res, next));
router.get('/:ticketId/sla', (req, res, next) => ticketingController.getSlaDetails(req, res, next));

module.exports = router;
