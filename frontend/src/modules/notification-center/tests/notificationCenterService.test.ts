import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/services/api', () => ({ apiCall: vi.fn() }));
vi.mock('@/config/features', () => ({ isNotificationCenterEnabled: true }));

describe('notificationCenterApi', () => {
  beforeEach(async () => {
    vi.resetModules();
    const { apiCall } = await import('@/services/api');
    vi.mocked(apiCall).mockReset();
  });

  it('getMyNotifications', async () => {
    const { apiCall } = await import('@/services/api');
    vi.mocked(apiCall).mockResolvedValue({ success: true, data: { notifications: [] } });
    const { notificationCenterApi } = await import('../services/notificationCenterService');
    await notificationCenterApi.getMyNotifications();
    expect(apiCall).toHaveBeenCalledWith('/notification-center/my-notifications', 'GET', undefined);
  });

  it('getUnreadCount', async () => {
    const { apiCall } = await import('@/services/api');
    vi.mocked(apiCall).mockResolvedValue({ success: true, data: { count: 3 } });
    const { notificationCenterApi } = await import('../services/notificationCenterService');
    await notificationCenterApi.getUnreadCount();
    expect(apiCall).toHaveBeenCalledWith('/notification-center/unread-count', 'GET', undefined);
  });

  it('markRead', async () => {
    const { apiCall } = await import('@/services/api');
    vi.mocked(apiCall).mockResolvedValue({ success: true, data: {} });
    const { notificationCenterApi } = await import('../services/notificationCenterService');
    await notificationCenterApi.markRead('n1');
    expect(apiCall).toHaveBeenCalledWith('/notification-center/mark-read/n1', 'PUT', undefined);
  });

  it('markAllRead', async () => {
    const { apiCall } = await import('@/services/api');
    vi.mocked(apiCall).mockResolvedValue({ success: true, data: { marked: true } });
    const { notificationCenterApi } = await import('../services/notificationCenterService');
    await notificationCenterApi.markAllRead();
    expect(apiCall).toHaveBeenCalledWith('/notification-center/mark-all-read', 'PUT', undefined);
  });

  it('updatePreferences', async () => {
    const { apiCall } = await import('@/services/api');
    vi.mocked(apiCall).mockResolvedValue({ success: true, data: {} });
    const { notificationCenterApi } = await import('../services/notificationCenterService');
    await notificationCenterApi.updatePreferences({ email_enabled: false });
    expect(apiCall).toHaveBeenCalledWith('/notification-center/preferences', 'PUT', { email_enabled: false });
  });

  it('503 when disabled', async () => {
    vi.doMock('@/config/features', () => ({ isNotificationCenterEnabled: false }));
    const { notificationCenterApi } = await import('../services/notificationCenterService');
    await expect(notificationCenterApi.getUnreadCount()).rejects.toMatchObject({ status: 503 });
  });
});
