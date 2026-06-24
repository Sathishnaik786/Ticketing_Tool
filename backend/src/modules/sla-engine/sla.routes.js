const express = require('express');
const router = express.Router();
const controller = require('./sla.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const requireRole = require('../../middlewares/role.middleware');

router.get('/', authMiddleware, controller.getPolicies);
router.post('/', authMiddleware, requireRole('ADMIN', 'HR'), controller.createPolicy);
router.get('/breaches', authMiddleware, controller.getBreaches);
router.post('/breaches/:id/acknowledge', authMiddleware, requireRole('ADMIN', 'HR'), controller.acknowledgeBreach);

router.get('/:id', authMiddleware, controller.getPolicy);
router.put('/:id', authMiddleware, requireRole('ADMIN', 'HR'), controller.updatePolicy);
router.delete('/:id', authMiddleware, requireRole('ADMIN', 'HR'), controller.deletePolicy);

module.exports = router;
