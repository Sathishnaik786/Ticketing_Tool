import { toast } from 'sonner';
import { apiCall } from '@/services/api';
import { isNotificationCenterEnabled } from '@/config/features';

export interface NotificationEvent {
  id: string;
  employee_id: string;
  event_type: string;
  title: string;
  message: string;
  source_module: string;
  source_id: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  status: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationPreferences {
  id?: string;
  employee_id?: string;
  email_enabled: boolean;
  in_app_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
}

export interface NotificationAnalytics {
  total: number;
  unread: number;
  readPct: number;
  deliveryPct: number;
  byModule: Array<{ module: string; count: number }>;
  byPriority: Array<{ priority: string; count: number }>;
}

async function ncCall<T>(url: string, method: string, body?: unknown): Promise<T> {
  if (!isNotificationCenterEnabled) {
    const error = new Error('Notification center module currently disabled.') as Error & { status?: number };
    error.status = 503;
    toast.error('Notification center module currently disabled.');
    throw error;
  }
  try {
    return (await apiCall(url, method, body)) as T;
  } catch (error) {
    const err = error as Error & { status?: number };
    toast.error(err.message || 'Notification request failed');
    throw err;
  }
}

export const notificationCenterApi = {
  getMyNotifications: (params?: Record<string, string>) => {
    const qs = new URLSearchParams(params ?? {}).toString();
    return ncCall<{ success: boolean; data: { notifications: NotificationEvent[] } }>(
      `/notification-center/my-notifications${qs ? `?${qs}` : ''}`,
      'GET'
    );
  },
  getUnreadCount: () =>
    ncCall<{ success: boolean; data: { count: number } }>('/notification-center/unread-count', 'GET'),
  markRead: (id: string) =>
    ncCall<{ success: boolean; data: NotificationEvent }>(`/notification-center/mark-read/${id}`, 'PUT'),
  markAllRead: () =>
    ncCall<{ success: boolean; data: { marked: boolean } }>('/notification-center/mark-all-read', 'PUT'),
  getPreferences: () =>
    ncCall<{ success: boolean; data: NotificationPreferences }>('/notification-center/preferences', 'GET'),
  updatePreferences: (payload: Partial<NotificationPreferences>) =>
    ncCall<{ success: boolean; data: NotificationPreferences }>('/notification-center/preferences', 'PUT', payload),
  getAnalytics: () =>
    ncCall<{ success: boolean; data: NotificationAnalytics }>('/notification-center/analytics', 'GET'),
};
