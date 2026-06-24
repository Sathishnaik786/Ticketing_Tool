const express = require('express');
const router = express.Router();
const controller = require('./approval.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

router.get('/pending', authMiddleware, controller.getUserPending);
router.post('/action', authMiddleware, controller.processAction);

module.exports = router;
