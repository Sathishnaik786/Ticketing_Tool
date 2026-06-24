const express = require('express');
const router = express.Router();
const leaveController = require('@controllers/leave.controller');
const authMiddleware = require('@middlewares/auth.middleware');
const roleMiddleware = require('@middlewares/role.middleware');

router.use(authMiddleware);

router.post('/apply', leaveController.apply);
router.get('/', leaveController.getAll);
router.get('/types', leaveController.getTypes);
router.put('/:id/approve', roleMiddleware(['ADMIN', 'HR', 'MANAGER']), leaveController.approve);
router.put('/:id/reject', roleMiddleware(['ADMIN', 'HR', 'MANAGER']), leaveController.reject);

module.exports = router;
