const express = require('express');
const authMiddleware = require('../../../middlewares/auth.middleware');
const approvalManagementFeatureFlag = require('../middleware/approval-management-feature-flag.middleware');
const approvalManagementController = require('../controllers/approval-management.controller');

const router = express.Router();

router.use(approvalManagementFeatureFlag);
router.use(authMiddleware);

router.get('/catalog', (req, res, next) => approvalManagementController.getCatalog(req, res, next));

router.post('/workflow', (req, res, next) => approvalManagementController.createWorkflow(req, res, next));
router.put('/workflow/:id', (req, res, next) => approvalManagementController.updateWorkflow(req, res, next));
router.get('/workflow/:id', (req, res, next) => approvalManagementController.getWorkflow(req, res, next));

router.post('/ticket/:ticketId/start', (req, res, next) => approvalManagementController.startTicketApproval(req, res, next));
router.post('/ticket/:ticketId/approve', (req, res, next) => approvalManagementController.approveTicket(req, res, next));
router.post('/ticket/:ticketId/reject', (req, res, next) => approvalManagementController.rejectTicket(req, res, next));
router.get('/ticket/:ticketId/state', (req, res, next) => approvalManagementController.getTicketApprovalState(req, res, next));

router.get('/my-approvals', (req, res, next) => approvalManagementController.getMyApprovals(req, res, next));
router.get('/pending', (req, res, next) => approvalManagementController.getPending(req, res, next));
router.get('/analytics', (req, res, next) => approvalManagementController.getAnalytics(req, res, next));

module.exports = router;
