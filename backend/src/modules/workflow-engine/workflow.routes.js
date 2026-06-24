const express = require('express');
const router = express.Router();
const controller = require('./workflow.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const requireRole = require('../../middlewares/role.middleware');

router.post('/:workflowId/draft', authMiddleware, requireRole(['ADMIN', 'MANAGER']), controller.createDraft);
router.put('/:workflowId/versions/:versionId/publish', authMiddleware, requireRole(['ADMIN', 'MANAGER']), controller.publish);
router.get('/tickets/:ticketId/state', authMiddleware, controller.getTicketState);

module.exports = router;
