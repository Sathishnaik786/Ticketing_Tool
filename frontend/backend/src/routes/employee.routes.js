const express = require('express');
const router = express.Router();
const employeeController = require('@controllers/employee.controller');
const authMiddleware = require('@middlewares/auth.middleware');
const roleMiddleware = require('@middlewares/role.middleware');

router.use(authMiddleware);

// Profile endpoints - no role restrictions, users can access only their own profile
router.get('/profile', employeeController.getProfile);
router.put('/profile', employeeController.updateProfile);

// Profile image upload endpoint
router.post('/profile/image', employeeController.uploadProfileImage);

// Regular employee endpoints with role restrictions
router.get('/', roleMiddleware(['ADMIN', 'HR', 'MANAGER']), employeeController.getAll);
router.get('/:id', employeeController.getById);
router.post('/', roleMiddleware(['ADMIN', 'HR']), employeeController.create);
router.put('/:id', roleMiddleware(['ADMIN', 'HR', 'MANAGER']), employeeController.update);
router.delete('/:id', roleMiddleware(['ADMIN', 'HR']), employeeController.delete);

module.exports = router;