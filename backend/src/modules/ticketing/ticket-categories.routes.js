const express = require('express');
const authMiddleware = require('@middlewares/auth.middleware');
const ticketingFeatureFlag = require('./middleware/ticketing-feature-flag.middleware');
const CategoryService = require('./services/category.service');

const categoryService = new CategoryService();
const router = express.Router();

router.use(ticketingFeatureFlag);
router.use(authMiddleware);

router.get('/', async (req, res, next) => {
  try {
    const result = await categoryService.listCategories(req.user);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
