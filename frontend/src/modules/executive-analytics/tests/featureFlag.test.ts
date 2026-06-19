import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('executive analytics feature flag', () => {
  beforeEach(() => { vi.resetModules(); });

  it('returns no routes when off', async () => {
    vi.stubEnv('VITE_ENABLE_EXECUTIVE_ANALYTICS', 'false');
    const { executiveAnalyticsRoutes } = await import('../executive-analytics.routes');
    expect(executiveAnalyticsRoutes).toEqual([]);
  });

  it('returns 4 routes when on', async () => {
    vi.stubEnv('VITE_ENABLE_EXECUTIVE_ANALYTICS', 'true');
    const { executiveAnalyticsRoutes } = await import('../executive-analytics.routes');
    expect(executiveAnalyticsRoutes.length).toBe(4);
  });

  it('returns no nav when off', async () => {
    vi.stubEnv('VITE_ENABLE_EXECUTIVE_ANALYTICS', 'false');
    const { filterNavItem } = await import('@/config/navigation.utils');
    const { NAV_ITEMS } = await import('@/config/navigation');
    const execItems = NAV_ITEMS.filter((i) => i.featureFlag === 'VITE_ENABLE_EXECUTIVE_ANALYTICS');
    expect(execItems.every((item) => !filterNavItem(item, { role: 'ADMIN' }))).toBe(true);
  });

  it('returns nav when on', async () => {
    vi.stubEnv('VITE_ENABLE_EXECUTIVE_ANALYTICS', 'true');
    const { NAV_ITEMS } = await import('@/config/navigation');
    const paths = NAV_ITEMS.filter((i) => i.legacyGroup === 'Executive Analytics').map((i) => i.href);
    expect(paths).toContain('/app/executive-dashboard');
  });

  it('strict true check', async () => {
    vi.stubEnv('VITE_ENABLE_EXECUTIVE_ANALYTICS', 'TRUE');
    const { isExecutiveAnalyticsEnabled } = await import('@/config/features');
    expect(isExecutiveAnalyticsEnabled).toBe(false);
  });

  it('executive route has element', async () => {
    vi.stubEnv('VITE_ENABLE_EXECUTIVE_ANALYTICS', 'true');
    const { executiveAnalyticsRoutes } = await import('../executive-analytics.routes');
    expect(executiveAnalyticsRoutes.find((r) => r.path === 'executive-dashboard')?.element).toBeTruthy();
  });
});
