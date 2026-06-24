import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('notification center feature flag', () => {
  beforeEach(() => { vi.resetModules(); });

  it('returns no routes when off', async () => {
    vi.stubEnv('VITE_ENABLE_NOTIFICATION_CENTER', 'false');
    const { notificationCenterRoutes } = await import('../notification-center.routes');
    expect(notificationCenterRoutes).toEqual([]);
  });

  it('returns 2 routes when on', async () => {
    vi.stubEnv('VITE_ENABLE_NOTIFICATION_CENTER', 'true');
    const { notificationCenterRoutes } = await import('../notification-center.routes');
    expect(notificationCenterRoutes.length).toBe(2);
  });

  it('returns no nav when off', async () => {
    vi.stubEnv('VITE_ENABLE_NOTIFICATION_CENTER', 'false');
    const { filterNavItem } = await import('@/config/navigation.utils');
    const { NAV_ITEMS } = await import('@/config/navigation');
    const items = NAV_ITEMS.filter((i) => i.featureFlag === 'VITE_ENABLE_NOTIFICATION_CENTER');
    expect(items.every((item) => !filterNavItem(item, { role: 'ADMIN' }))).toBe(true);
  });

  it('returns nav when on', async () => {
    vi.stubEnv('VITE_ENABLE_NOTIFICATION_CENTER', 'true');
    const { buildEtmsNavGroups } = await import('@/config/navigation.utils');
    const group = buildEtmsNavGroups().find((g) => g.id === 'notifications');
    expect(group?.label).toBe('Notifications');
  });

  it('strict true check', async () => {
    vi.stubEnv('VITE_ENABLE_NOTIFICATION_CENTER', 'TRUE');
    const { isNotificationCenterEnabled } = await import('@/config/features');
    expect(isNotificationCenterEnabled).toBe(false);
  });

  it('notifications route has element', async () => {
    vi.stubEnv('VITE_ENABLE_NOTIFICATION_CENTER', 'true');
    const { notificationCenterRoutes } = await import('../notification-center.routes');
    expect(notificationCenterRoutes.find((r) => r.path === 'notifications')?.element).toBeTruthy();
  });
});
