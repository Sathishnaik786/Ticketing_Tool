const express = require('express');
const router = express.Router();
const controller = require('./notification.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

router.get('/preferences', authMiddleware, controller.getPreferences);
router.put('/preferences', authMiddleware, controller.updatePreferences);

module.exports = router;
