const ChatService = require('./chat.service');

class NotificationController {
  // Get user's notifications
  static async getNotifications(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 50 } = req.query;

      const notifications = await ChatService.getUserNotifications(userId, parseInt(page), parseInt(limit));
      
      res.json(notifications);
    } catch (error) {
      console.error('Error getting notifications:', error);
      res.status(500).json({ message: 'Error retrieving notifications', error: error.message });
    }
  }

  // Mark notification as read
  static async markNotificationRead(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      await ChatService.markNotificationRead(id, userId);
      
      res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ message: 'Error marking notification as read', error: error.message });
    }
  }

  // Mark all notifications as read
  static async markAllNotificationsRead(req, res) {
    try {
      const userId = req.user.id;

      await ChatService.markAllNotificationsRead(userId);
      
      res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({ message: 'Error marking all notifications as read', error: error.message });
    }
  }

  // Get unread notifications count
  static async getUnreadCount(req, res) {
    try {
      const userId = req.user.id;

      const count = await ChatService.getUnreadNotificationsCount(userId);
      
      res.json({ count });
    } catch (error) {
      console.error('Error getting unread count:', error);
      res.status(500).json({ message: 'Error retrieving unread count', error: error.message });
    }
  }
}

module.exports = NotificationController;