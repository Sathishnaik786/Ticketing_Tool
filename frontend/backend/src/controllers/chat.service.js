const { supabase, supabaseAdmin } = require('@lib/supabase');

class ChatService {
  // Function to determine if users can chat based on roles
  static canChat(senderRole, receiverRole) {
    if (senderRole === "ADMIN") return true;
    if (senderRole === "MANAGER" && ["EMPLOYEE", "ADMIN"].includes(receiverRole)) return true;
    if (senderRole === "EMPLOYEE" && receiverRole === "MANAGER") return true;
    if (senderRole === "HR" && ["MANAGER", "EMPLOYEE"].includes(receiverRole)) return true;
    return false;
  }

  // Find or create a conversation between two users
  static async findOrCreateConversation(user1Id, user2Id) {
    // Ensure consistent ordering (user1_id < user2_id) to satisfy the constraint
    const [orderedUser1Id, orderedUser2Id] = user1Id < user2Id ? [user1Id, user2Id] : [user2Id, user1Id];
    
    // First try to find existing conversation
    const { data: existingConversation, error: findError } = await supabase
      .from('chat_conversations')
      .select('*')
      .or(`and(user1_id.eq.${orderedUser1Id},user2_id.eq.${orderedUser2Id})`)
      .single();

    if (findError && findError.code !== 'PGRST116') {
      throw findError;
    }

    if (existingConversation) {
      return existingConversation;
    }

    // Create new conversation if not found
    const { data: newConversation, error: createError } = await supabase
      .from('chat_conversations')
      .insert([{ user1_id: orderedUser1Id, user2_id: orderedUser2Id }])
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    return newConversation;
  }

  // Get conversations for a user
  static async getUserConversations(userId) {
    const { data: conversations, error } = await supabase
      .from('chat_conversations')
      .select(`
        id,
        created_at,
        user1_id,
        user2_id,
        users!user1_id (id, email),
        users!user2_id (id, email)
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

    if (error) {
      throw error;
    }

    // Get employee details for all users in conversations
    const userIds = [];
    conversations.forEach(conv => {
      if (conv.user1_id !== userId) userIds.push(conv.user1_id);
      if (conv.user2_id !== userId) userIds.push(conv.user2_id);
    });
    
    // Remove duplicates
    const uniqueUserIds = [...new Set(userIds)];
    
    let employeeMap = {};
    if (uniqueUserIds.length > 0) {
      const { data: employees, error: empError } = await supabase
        .from('employees')
        .select('user_id, first_name, last_name, role')
        .in('user_id', uniqueUserIds);
        
      if (!empError) {
        employees.forEach(emp => {
          employeeMap[emp.user_id] = emp;
        });
      }
    }

    // Format conversations with other user info and last message
    const formattedConversations = [];
    
    for (const conv of conversations) {
      // Determine the other user in the conversation
      const otherUserId = conv.user1_id === userId ? conv.user2_id : conv.user1_id;
      const otherUser = conv.user1_id === userId ? conv.users2 : conv.users1;
      
      // Get employee details if available
      const employeeDetails = employeeMap[otherUserId];
      
      // Get the last message in this conversation
      const { data: lastMessage, error: msgError } = await supabase
        .from('chat_messages')
        .select('message, created_at, sender_id')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Get unread count for this conversation
      const { count: unreadCount, error: countError } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conv.id)
        .eq('receiver_id', userId)
        .eq('is_read', false);

      formattedConversations.push({
        conversationId: conv.id,
        user: {
          id: otherUser.id,
          email: otherUser.email,
          name: employeeDetails ? `${employeeDetails.first_name} ${employeeDetails.last_name}` : otherUser.email,
          role: employeeDetails ? employeeDetails.role : null
        },
        lastMessage: lastMessage ? lastMessage.message : null,
        lastMessageTime: lastMessage ? lastMessage.created_at : null,
        unreadCount: unreadCount || 0
      });
    }

    return formattedConversations;
  }

  // Get messages for a conversation
  static async getConversationMessages(conversationId, userId, page = 1, limit = 50) {
    // First verify that user has access to this conversation
    const { data: conversation, error: convError } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('id', conversationId)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .single();

    if (convError || !conversation) {
      throw new Error('Conversation not found or access denied');
    }

    const offset = (page - 1) * limit;
    
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select(`
        id,
        conversation_id,
        sender_id,
        receiver_id,
        message,
        is_read,
        created_at,
        sender:users!sender_id (id, email)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }
    
    // Get employee details for all senders
    const senderIds = messages.map(msg => msg.sender_id);
    let employeeMap = {};
    if (senderIds.length > 0) {
      const { data: employees, error: empError } = await supabase
        .from('employees')
        .select('user_id, first_name, last_name')
        .in('user_id', senderIds);
        
      if (!empError) {
        employees.forEach(emp => {
          employeeMap[emp.user_id] = emp;
        });
      }
    }

    return messages.map(msg => {
      const employeeDetails = employeeMap[msg.sender_id];
      return {
        id: msg.id,
        conversationId: msg.conversation_id,
        senderId: msg.sender_id,
        receiverId: msg.receiver_id,
        message: msg.message,
        isRead: msg.is_read,
        createdAt: msg.created_at,
        sender: {
          id: msg.sender.id,
          email: msg.sender.email,
          firstName: employeeDetails ? employeeDetails.first_name : 'Unknown',
          lastName: employeeDetails ? employeeDetails.last_name : 'User'
        }
      };
    });
  }

  // Send a message
  static async sendMessage(senderId, receiverId, messageText) {
    // Get sender and receiver details to check roles
    const { data: senderEmployee, error: senderError } = await supabaseAdmin
      .from('employees')
      .select('role')
      .eq('user_id', senderId)
      .single();

    const { data: receiverEmployee, error: receiverError } = await supabaseAdmin
      .from('employees')
      .select('role')
      .eq('user_id', receiverId)
      .single();

    if (senderError || !senderEmployee || receiverError || !receiverEmployee) {
      throw new Error('Could not verify user roles');
    }

    // Check if the chat is allowed based on roles
    if (!this.canChat(senderEmployee.role, receiverEmployee.role)) {
      throw new Error('Chat not allowed between these roles');
    }

    // Find or create conversation
    const conversation = await this.findOrCreateConversation(senderId, receiverId);

    // Insert the message
    const { data: newMessage, error: msgError } = await supabase
      .from('chat_messages')
      .insert([{
        conversation_id: conversation.id,
        sender_id: senderId,
        receiver_id: receiverId,
        message: messageText
      }])
      .select()
      .single();

    if (msgError) {
      throw msgError;
    }

    return {
      id: newMessage.id,
      conversationId: newMessage.conversation_id,
      senderId: newMessage.sender_id,
      receiverId: newMessage.receiver_id,
      message: newMessage.message,
      isRead: newMessage.is_read,
      createdAt: newMessage.created_at
    };
  }

  // Mark messages as read in a conversation
  static async markMessagesRead(conversationId, userId) {
    const { error } = await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .eq('receiver_id', userId)
      .eq('is_read', false);

    if (error) {
      throw error;
    }
  }

  // Create a notification
  static async createNotification(userId, type, title, message, link = null, sourceId = null) {
    const { data: newNotification, error } = await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        type,
        title,
        message,
        link,
        source_id: sourceId
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return newNotification;
  }

  // Get notifications for a user
  static async getUserNotifications(userId, page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return notifications;
  }

  // Mark a notification as read
  static async markNotificationRead(notificationId, userId) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }
  }

  // Mark all notifications as read
  static async markAllNotificationsRead(userId) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      throw error;
    }
  }

  // Get unread notifications count
  static async getUnreadNotificationsCount(userId) {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      throw error;
    }

    return count || 0;
  }
}

module.exports = ChatService;