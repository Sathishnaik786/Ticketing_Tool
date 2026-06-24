const express = require('express');
const router = express.Router();
const NotificationController = require('@controllers/notification.controller');
const authMiddleware = require('@middlewares/auth.middleware');

// Get user's notifications
router.get('/', authMiddleware, NotificationController.getNotifications);

// Mark notification as read
router.post('/read/:id', authMiddleware, NotificationController.markNotificationRead);

// Mark all notifications as read
router.post('/read-all', authMiddleware, NotificationController.markAllNotificationsRead);

// Get unread notifications count
router.get('/unread-count', authMiddleware, NotificationController.getUnreadCount);

module.exports = router;