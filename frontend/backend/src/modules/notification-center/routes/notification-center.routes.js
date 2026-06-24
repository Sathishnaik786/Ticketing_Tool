const express = require('express');
const authMiddleware = require('../../../middlewares/auth.middleware');
const notificationCenterFeatureFlag = require('../middleware/notification-center-feature-flag.middleware');
const notificationCenterController = require('../controllers/notification-center.controller');

const router = express.Router();

router.use(notificationCenterFeatureFlag);
router.use(authMiddleware);

router.get('/my-notifications', (req, res, next) => notificationCenterController.getMyNotifications(req, res, next));
router.get('/unread-count', (req, res, next) => notificationCenterController.getUnreadCount(req, res, next));
router.put('/mark-read/:id', (req, res, next) => notificationCenterController.markRead(req, res, next));
router.put('/mark-all-read', (req, res, next) => notificationCenterController.markAllRead(req, res, next));
router.get('/preferences', (req, res, next) => notificationCenterController.getPreferences(req, res, next));
router.put('/preferences', (req, res, next) => notificationCenterController.updatePreferences(req, res, next));
router.get('/analytics', (req, res, next) => notificationCenterController.getAnalytics(req, res, next));
router.get('/templates', (req, res, next) => notificationCenterController.listTemplates(req, res, next));
router.post('/templates', (req, res, next) => notificationCenterController.createTemplate(req, res, next));
router.put('/templates/:id', (req, res, next) => notificationCenterController.updateTemplate(req, res, next));
router.delete('/templates/:id', (req, res, next) => notificationCenterController.deleteTemplate(req, res, next));

module.exports = router;
