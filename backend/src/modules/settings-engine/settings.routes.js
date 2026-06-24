const express = require('express');
const router = express.Router();
const controller = require('./settings.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const requireRole = require('../../middlewares/role.middleware');

router.get('/', authMiddleware, requireRole('ADMIN', 'HR'), controller.getSettings);
router.put('/:key', authMiddleware, requireRole('ADMIN', 'HR'), controller.updateSetting);

module.exports = router;
