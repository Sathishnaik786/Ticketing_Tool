import { io, Socket } from 'socket.io-client';
import { User } from '@/types';

// Define types for chat functionality
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
  conversationId: string;
}

export interface Conversation {
  id: string;
  participants: string[]; // Array of user IDs
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

class ChatService {
  private socket: Socket | null = null;
  private static instance: ChatService;
  
  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  connect(userId: string, token: string) {
    if (this.socket?.connected) return;
    
    const apiUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3003';
    
    this.socket = io(apiUrl, {
      auth: {
        token
      },
      transports: ['websocket', 'polling'], // Fallback to polling if websocket fails
      reconnection: true,
      reconnectionDelay: 1000, // Start with 1 second
      reconnectionDelayMax: 5000, // Max 5 seconds
      reconnectionAttempts: Infinity, // Keep trying to reconnect
      timeout: 20000, // Connection timeout
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to chat server');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('⚠️ Disconnected from chat server:', reason);
      if (reason === 'io server disconnect') {
        // Server disconnected, need to manually reconnect
        this.socket?.connect();
      }
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}`);
      this.reconnectAttempts = attemptNumber;
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`✅ Reconnected after ${attemptNumber} attempts`);
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('❌ Reconnection error:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ Reconnection failed - max attempts reached');
    });

    this.socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  sendMessage(receiverId: string, message: string) {
    if (this.socket) {
      this.socket.emit('chat:send', {
        receiverId,
        message
      });
    }
  }

  joinConversation(conversationId: string) {
    if (this.socket) {
      this.socket.emit('joinConversation', conversationId);
    }
  }

  leaveConversation(conversationId: string) {
    if (this.socket) {
      this.socket.emit('leaveConversation', conversationId);
    }
  }

  subscribeToConversation(conversationId: string, callback: (message: ChatMessage) => void) {
    if (this.socket) {
      this.socket.on(`message:${conversationId}`, callback);
    }
  }

  unsubscribeFromConversation(conversationId: string) {
    if (this.socket) {
      this.socket.off(`message:${conversationId}`);
    }
  }

  subscribeToNewMessage(callback: (message: ChatMessage) => void) {
    if (this.socket) {
      this.socket.on('chat:receive', callback);
    }
  }

  unsubscribeFromNewMessage() {
    if (this.socket) {
      this.socket.off('chat:receive');
    }
  }

  subscribeToTyping(conversationId: string, callback: (userId: string, isTyping: boolean) => void) {
    if (this.socket) {
      this.socket.on(`typing:${conversationId}`, callback);
    }
  }

  sendTypingStatus(conversationId: string, isTyping: boolean) {
    if (this.socket) {
      this.socket.emit('typing', { conversationId, isTyping });
    }
  }

  markMessageAsRead(messageId: string, userId: string) {
    if (this.socket) {
      this.socket.emit('markAsRead', { messageId, userId });
    }
  }
}

export const chatService = ChatService.getInstance();