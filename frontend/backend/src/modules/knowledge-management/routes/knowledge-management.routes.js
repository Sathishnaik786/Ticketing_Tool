const express = require('express');
const authMiddleware = require('../../../middlewares/auth.middleware');
const knowledgeManagementFeatureFlag = require('../middleware/knowledge-management-feature-flag.middleware');
const knowledgeManagementController = require('../controllers/knowledge-management.controller');

const router = express.Router();

router.use(knowledgeManagementFeatureFlag);
router.use(authMiddleware);

router.get('/categories', (req, res, next) => knowledgeManagementController.getCategories(req, res, next));

router.get('/search', (req, res, next) => knowledgeManagementController.searchArticles(req, res, next));

router.get('/analytics', (req, res, next) => knowledgeManagementController.getAnalytics(req, res, next));

router.get('/articles', (req, res, next) => knowledgeManagementController.listArticles(req, res, next));
router.post('/articles', (req, res, next) => knowledgeManagementController.createArticle(req, res, next));
router.get('/articles/:id', (req, res, next) => knowledgeManagementController.getArticle(req, res, next));
router.put('/articles/:id', (req, res, next) => knowledgeManagementController.updateArticle(req, res, next));
router.post('/articles/:id/publish', (req, res, next) => knowledgeManagementController.publishArticle(req, res, next));
router.post('/articles/:id/archive', (req, res, next) => knowledgeManagementController.archiveArticle(req, res, next));
router.post('/articles/:id/rate', (req, res, next) => knowledgeManagementController.rateArticle(req, res, next));
router.post('/articles/:id/feedback', (req, res, next) => knowledgeManagementController.submitFeedback(req, res, next));
router.get('/articles/:id/related', (req, res, next) => knowledgeManagementController.getRelatedArticles(req, res, next));

module.exports = router;
