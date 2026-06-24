const ChatService = require('./chat.service');

class ChatController {
  // Get user's conversations
  static async getConversations(req, res) {
    try {
      const userId = req.user.id;
      const conversations = await ChatService.getUserConversations(userId);
      
      res.json(conversations);
    } catch (error) {
      console.error('Error getting conversations:', error);
      res.status(500).json({ message: 'Error retrieving conversations', error: error.message });
    }
  }

  // Get messages for a conversation
  static async getMessages(req, res) {
    try {
      const { conversationId } = req.params;
      const userId = req.user.id;
      const { page = 1, limit = 50 } = req.query;

      const messages = await ChatService.getConversationMessages(conversationId, userId, parseInt(page), parseInt(limit));
      
      res.json(messages);
    } catch (error) {
      console.error('Error getting messages:', error);
      res.status(500).json({ message: 'Error retrieving messages', error: error.message });
    }
  }

  // Mark messages as read
  static async markMessagesRead(req, res) {
    try {
      const { conversationId } = req.params;
      const userId = req.user.id;

      await ChatService.markMessagesRead(conversationId, userId);
      
      res.json({ success: true, message: 'Messages marked as read' });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      res.status(500).json({ message: 'Error marking messages as read', error: error.message });
    }
  }
}

module.exports = ChatController;