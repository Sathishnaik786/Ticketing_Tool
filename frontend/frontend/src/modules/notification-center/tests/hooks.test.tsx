import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

vi.mock('../services/notificationCenterService', () => ({
  notificationCenterApi: {
    getMyNotifications: vi.fn(),
    getUnreadCount: vi.fn(),
    getPreferences: vi.fn(),
    getAnalytics: vi.fn(),
    markRead: vi.fn(),
    markAllRead: vi.fn(),
    updatePreferences: vi.fn(),
  },
}));

vi.mock('@/config/features', () => ({ isNotificationCenterEnabled: true }));

const api = await import('../services/notificationCenterService');

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe('useNotificationCenter hooks', () => {
  beforeEach(() => vi.clearAllMocks());

  it('useMyNotifications', async () => {
    vi.mocked(api.notificationCenterApi.getMyNotifications).mockResolvedValue({ success: true, data: { notifications: [] } } as never);
    const { useMyNotifications } = await import('../hooks/useNotificationCenter');
    const { result } = renderHook(() => useMyNotifications(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('useUnreadNotificationCount', async () => {
    vi.mocked(api.notificationCenterApi.getUnreadCount).mockResolvedValue({ success: true, data: { count: 2 } } as never);
    const { useUnreadNotificationCount } = await import('../hooks/useNotificationCenter');
    const { result } = renderHook(() => useUnreadNotificationCount(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.data).toBe(2));
  });

  it('useNotificationPreferences', async () => {
    vi.mocked(api.notificationCenterApi.getPreferences).mockResolvedValue({ success: true, data: { in_app_enabled: true, email_enabled: true, sms_enabled: false, push_enabled: false } } as never);
    const { useNotificationPreferences } = await import('../hooks/useNotificationCenter');
    const { result } = renderHook(() => useNotificationPreferences(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('useNotificationAnalytics', async () => {
    vi.mocked(api.notificationCenterApi.getAnalytics).mockResolvedValue({ success: true, data: { total: 0, unread: 0, readPct: 0, deliveryPct: 0, byModule: [], byPriority: [] } } as never);
    const { useNotificationAnalytics } = await import('../hooks/useNotificationCenter');
    const { result } = renderHook(() => useNotificationAnalytics(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
