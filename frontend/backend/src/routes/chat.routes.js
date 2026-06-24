const express = require('express');
const router = express.Router();
const ChatController = require('@controllers/chat.controller');
const authMiddleware = require('@middlewares/auth.middleware');

// Get user's conversations
router.get('/conversations', authMiddleware, ChatController.getConversations);

// Get messages for a conversation
router.get('/messages/:conversationId', authMiddleware, ChatController.getMessages);

// Mark messages as read in a conversation
router.post('/read/:conversationId', authMiddleware, ChatController.markMessagesRead);

module.exports = router;