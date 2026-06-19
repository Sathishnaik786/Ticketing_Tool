import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('executive analytics nav RBAC', () => {
  beforeEach(() => { vi.resetModules(); });

  it('nav items include executive dashboard path', async () => {
    vi.stubEnv('VITE_ENABLE_EXECUTIVE_ANALYTICS', 'true');
    const { NAV_ITEMS } = await import('@/config/navigation');
    const paths = NAV_ITEMS.map((i) => i.href);
    expect(paths).toContain('/app/executive-dashboard');
  });

  it('nav items include department analytics', async () => {
    vi.stubEnv('VITE_ENABLE_EXECUTIVE_ANALYTICS', 'true');
    const { NAV_ITEMS } = await import('@/config/navigation');
    const paths = NAV_ITEMS.map((i) => i.href);
    expect(paths).toContain('/app/department-analytics');
  });

  it('routes include business unit page', async () => {
    vi.stubEnv('VITE_ENABLE_EXECUTIVE_ANALYTICS', 'true');
    const { executiveAnalyticsRoutes } = await import('../executive-analytics.routes');
    expect(executiveAnalyticsRoutes.some((r) => r.path === 'business-unit-analytics')).toBe(true);
  });

  it('routes include analytics reports', async () => {
    vi.stubEnv('VITE_ENABLE_EXECUTIVE_ANALYTICS', 'true');
    const { executiveAnalyticsRoutes } = await import('../executive-analytics.routes');
    expect(executiveAnalyticsRoutes.some((r) => r.path === 'analytics-reports')).toBe(true);
  });
});
