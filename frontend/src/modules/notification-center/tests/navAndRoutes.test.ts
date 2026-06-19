import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('notification center nav and routes', () => {
  beforeEach(() => { vi.resetModules(); });

  it('nav includes notifications path', async () => {
    vi.stubEnv('VITE_ENABLE_NOTIFICATION_CENTER', 'true');
    const { NAV_ITEMS } = await import('@/config/navigation');
    const paths = NAV_ITEMS.map((i) => i.href);
    expect(paths).toContain('/app/notifications');
  });

  it('nav includes analytics path', async () => {
    vi.stubEnv('VITE_ENABLE_NOTIFICATION_CENTER', 'true');
    const { NAV_ITEMS } = await import('@/config/navigation');
    const paths = NAV_ITEMS.map((i) => i.href);
    expect(paths).toContain('/app/notification-analytics');
  });

  it('analytics nav restricted to manager+', async () => {
    vi.stubEnv('VITE_ENABLE_NOTIFICATION_CENTER', 'true');
    const { NAV_ITEMS } = await import('@/config/navigation');
    const analytics = NAV_ITEMS.find((i) => i.id === 'notifications-analytics');
    expect(analytics?.roles).toContain('MANAGER');
  });

  it('routes include notification-analytics', async () => {
    vi.stubEnv('VITE_ENABLE_NOTIFICATION_CENTER', 'true');
    const { notificationCenterRoutes } = await import('../notification-center.routes');
    expect(notificationCenterRoutes.some((r) => r.path === 'notification-analytics')).toBe(true);
  });
});
