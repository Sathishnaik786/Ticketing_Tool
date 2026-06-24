const express = require('express');
const router = express.Router();
const controller = require('./eventStore.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const requireRole = require('../../middlewares/role.middleware');

router.get('/:type/:id', authMiddleware, requireRole(['ADMIN', 'MANAGER']), controller.getEventsHistory);
router.get('/replay/ticket/:id', authMiddleware, requireRole(['ADMIN', 'MANAGER']), controller.replayTicket);

module.exports = router;
