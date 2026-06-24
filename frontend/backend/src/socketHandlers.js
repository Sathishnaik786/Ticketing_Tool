const { supabase, supabaseAdmin } = require('@lib/supabase');
const ChatService = require('./controllers/chat.service');

// In-memory storage for active connections and conversations
const activeUsers = new Map(); // userId -> socketId
const userConversations = new Map(); // userId -> Set of conversationIds

class SocketHandlers {
  static initialize(io) {
    // Store io instance for event service
    this.io = io;
    io.use(async (socket, next) => {
      try {
        const { token } = socket.handshake.auth;
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        // Verify token using Supabase auth
        const { data, error } = await supabase.auth.getUser(token);
        
        if (error || !data?.user) {
          return next(new Error('Invalid token'));
        }

        // Load employee mapping to get role - use admin client to bypass RLS during auth
        const { data: employee, error: empError } = await supabaseAdmin
          .from('employees')
          .select('*')
          .eq('user_id', data.user.id)
          .maybeSingle();

        if (empError) {
          console.error('Employee lookup error:', empError);
        }

        if (!employee) {
          return next(new Error('Permission denied: User exists but is not mapped to an employee record'));
        }

        socket.userId = data.user.id;
        socket.user = {
          ...data.user,
          role: employee.role,
          employeeId: employee.id,
          firstName: employee.first_name,
          lastName: employee.last_name,
          departmentId: employee.department_id
        };
        
        // Join user-specific room
        socket.join(`user:${socket.userId}`);
        
        // Join role-specific room for role-based broadcasts
        socket.join(`role:${employee.role}`);
        
        // Join department room if applicable
        if (employee.department_id) {
          socket.join(`department:${employee.department_id}`);
        }
        
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });

    io.on('connection', (socket) => {
      console.log(`User ${socket.userId} connected via socket ${socket.id}`);

      // Add user to active users
      activeUsers.set(socket.userId, socket.id);

      // Join conversation rooms
      socket.on('joinConversation', (conversationId) => {
        socket.join(conversationId);
        
        // Track user's conversations
        if (!userConversations.has(socket.userId)) {
          userConversations.set(socket.userId, new Set());
        }
        userConversations.get(socket.userId).add(conversationId);
      });

      socket.on('leaveConversation', (conversationId) => {
        socket.leave(conversationId);
        
        // Remove from user's conversations
        if (userConversations.has(socket.userId)) {
          userConversations.get(socket.userId).delete(conversationId);
        }
      });

      // Handle sending messages
      socket.on('chat:send', async (messageData) => {
        try {
          const senderId = socket.userId;
          const receiverId = messageData.receiverId;
          const messageText = messageData.message;

          // Get receiver details to check roles
          const { data: receiverEmployee, error: receiverError } = await supabaseAdmin
            .from('employees')
            .select('role')
            .eq('user_id', receiverId)
            .single();

          if (receiverError || !receiverEmployee) {
            throw new Error('Could not verify receiver role');
          }

          // Check if the chat is allowed based on roles
          if (!ChatService.canChat(socket.user.role, receiverEmployee.role)) {
            throw new Error('Chat not allowed between these roles');
          }

          // Send the message using the service
          const newMessage = await ChatService.sendMessage(senderId, receiverId, messageText);

          // Add sender name to the message
          const messageWithSender = {
            ...newMessage,
            senderName: `${socket.user.firstName} ${socket.user.lastName}`,
            sender: {
              id: socket.user.id,
              firstName: socket.user.firstName,
              lastName: socket.user.lastName,
              email: socket.user.email
            }
          };

          // Emit to receiver in their user room
          io.to(`user:${receiverId}`).emit('chat:receive', messageWithSender);

          // Create notification for the receiver
          await ChatService.createNotification(
            receiverId,
            'MESSAGE',
            'New Message',
            `${socket.user.firstName} ${socket.user.lastName} sent you a message`,
            `/chat?conversation=${newMessage.conversationId}`
          );

          // Emit notification to receiver
          io.to(`user:${receiverId}`).emit('notification:new', {
            type: 'MESSAGE',
            title: 'New Message',
            message: `${socket.user.firstName} ${socket.user.lastName} sent you a message`,
            link: `/chat?conversation=${newMessage.conversationId}`,
            createdAt: new Date().toISOString()
          });

        } catch (error) {
          console.error('Error sending message:', error);
          socket.emit('error', { message: 'Failed to send message', error: error.message });
        }
      });

      // Handle typing indicators
      socket.on('typing', ({ conversationId, isTyping }) => {
        socket.to(conversationId).emit(`typing:${conversationId}`, {
          userId: socket.userId,
          isTyping
        });
      });

      // Handle marking messages as read
      socket.on('markAsRead', async ({ conversationId, userId }) => {
        try {
          await ChatService.markMessagesRead(conversationId, userId);
          
          // Emit event to notify that messages have been read
          io.to(`user:${userId}`).emit('messages:read', { conversationId });
        } catch (error) {
          console.error('Error marking messages as read:', error);
        }
      });

      // Handle notifications
      socket.on('markNotificationAsRead', async ({ notificationId, userId }) => {
        try {
          await ChatService.markNotificationRead(notificationId, userId);
        } catch (error) {
          console.error('Error marking notification as read:', error);
        }
      });

      socket.on('markAllNotificationsAsRead', async ({ userId }) => {
        try {
          await ChatService.markAllNotificationsRead(userId);
        } catch (error) {
          console.error('Error marking all notifications as read:', error);
        }
      });

      socket.on('getUnreadCount', async ({ userId }, callback) => {
        try {
          const count = await ChatService.getUnreadNotificationsCount(userId);
          callback({ count: count || 0 });
        } catch (error) {
          console.error('Error getting unread count:', error);
          callback({ count: 0 });
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`User ${socket.userId} disconnected`);
        activeUsers.delete(socket.userId);
        if (userConversations.has(socket.userId)) {
          userConversations.delete(socket.userId);
        }
      });
    });
  }

  // Method to emit notifications to specific user
  static emitNotification(io, userId, notification) {
    io.to(`user:${userId}`).emit('notification:new', notification);
  }

  // Method to broadcast notifications to multiple users
  static broadcastNotification(io, userIds, notification) {
    userIds.forEach(userId => {
      this.emitNotification(io, userId, notification);
    });
  }

  // Get io instance for event service
  static getIO() {
    return this.io;
  }
}

module.exports = SocketHandlers;