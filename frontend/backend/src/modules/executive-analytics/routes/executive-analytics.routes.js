const express = require('express');
const authMiddleware = require('../../../middlewares/auth.middleware');
const executiveAnalyticsFeatureFlag = require('../middleware/executive-analytics-feature-flag.middleware');
const executiveAnalyticsController = require('../controllers/executive-analytics.controller');

const router = express.Router();

router.use(executiveAnalyticsFeatureFlag);
router.use(authMiddleware);

router.get('/executive-dashboard', (req, res, next) => executiveAnalyticsController.getExecutiveDashboard(req, res, next));
router.get('/department-dashboard', (req, res, next) => executiveAnalyticsController.getDepartmentDashboard(req, res, next));
router.get('/business-unit-dashboard', (req, res, next) => executiveAnalyticsController.getBusinessUnitDashboard(req, res, next));
router.get('/sla', (req, res, next) => executiveAnalyticsController.getSlaAnalytics(req, res, next));
router.get('/csat', (req, res, next) => executiveAnalyticsController.getCsatAnalytics(req, res, next));
router.get('/approvals', (req, res, next) => executiveAnalyticsController.getApprovalAnalytics(req, res, next));
router.get('/knowledge', (req, res, next) => executiveAnalyticsController.getKnowledgeAnalytics(req, res, next));
router.get('/trends', (req, res, next) => executiveAnalyticsController.getTrendAnalytics(req, res, next));
router.get('/reports', (req, res, next) => executiveAnalyticsController.listReports(req, res, next));
router.post('/reports', (req, res, next) => executiveAnalyticsController.createReport(req, res, next));

module.exports = router;
