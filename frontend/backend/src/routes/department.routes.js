const express = require('express');
const router = express.Router();
const departmentController = require('@controllers/department.controller');
const authMiddleware = require('@middlewares/auth.middleware');
const roleMiddleware = require('@middlewares/role.middleware');

router.use(authMiddleware);

router.get('/', departmentController.getAll);
router.get('/:id', departmentController.getById);
router.post('/', roleMiddleware(['ADMIN', 'HR']), departmentController.create);
router.put('/:id', roleMiddleware(['ADMIN', 'HR']), departmentController.update);

module.exports = router;
