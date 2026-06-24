import { io, Socket } from 'socket.io-client';
import { User } from '@/types';

// Define types for notification functionality
export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'message';
}

class NotificationService {
  private socket: Socket | null = null;
  private static instance: NotificationService;
  
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
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
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      timeout: 20000,
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to notification server');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('⚠️ Disconnected from notification server:', reason);
      if (reason === 'io server disconnect') {
        this.socket?.connect();
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`✅ Notification server reconnected after ${attemptNumber} attempts`);
    });

    this.socket.on('error', (error) => {
      console.error('❌ Notification socket error:', error);
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

  subscribeToNotifications(callback: (notification: Notification) => void) {
    if (this.socket) {
      this.socket.on('notification:new', callback);
    }
  }

  unsubscribeFromNotifications() {
    if (this.socket) {
      this.socket.off('notification:new');
    }
  }

  markAsRead(notificationId: string, userId: string) {
    if (this.socket) {
      this.socket.emit('markNotificationAsRead', { notificationId, userId });
    }
  }

  markAllAsRead(userId: string) {
    if (this.socket) {
      this.socket.emit('markAllNotificationsAsRead', { userId });
    }
  }

  getUnreadCount(userId: string): Promise<number> {
    return new Promise((resolve) => {
      if (this.socket) {
        this.socket.emit('getUnreadCount', { userId }, (response: { count: number }) => {
          resolve(response.count);
        });
      } else {
        resolve(0);
      }
    });
  }
}

export const notificationService = NotificationService.getInstance();