const express = require('express');
const router = express.Router();
const controller = require('./catalog.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

router.get('/categories', authMiddleware, controller.getCategories);
router.get('/categories/:categoryId/items', authMiddleware, controller.getItems);
router.get('/items/:id', authMiddleware, controller.getItemDetails);
router.post('/request', authMiddleware, controller.submitRequest);

module.exports = router;
