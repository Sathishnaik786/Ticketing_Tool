const express = require('express');
const router = express.Router();
const documentController = require('@controllers/document.controller');
const authMiddleware = require('@middlewares/auth.middleware');

router.use(authMiddleware);

router.post('/upload', documentController.upload);
router.get('/:employeeId', documentController.getByEmployee);

module.exports = router;
