import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('communication tracking feature flag', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('returns no routes when flag is off', async () => {
    vi.stubEnv('VITE_ENABLE_COMMUNICATION_TRACKING', 'false');
    const { communicationTrackingRoutes } = await import('../communication-tracking.routes');
    expect(communicationTrackingRoutes).toEqual([]);
  });

  it('returns routes when flag is on', async () => {
    vi.stubEnv('VITE_ENABLE_COMMUNICATION_TRACKING', 'true');
    const { communicationTrackingRoutes } = await import('../communication-tracking.routes');
    expect(communicationTrackingRoutes.length).toBe(3);
    expect(communicationTrackingRoutes.map((r) => r.path)).toEqual([
      'communications',
      'activity-timeline',
      'communication-analytics',
    ]);
  });

  it('returns no nav when flag is off', async () => {
    vi.stubEnv('VITE_ENABLE_COMMUNICATION_TRACKING', 'false');
    const { filterNavItem } = await import('@/config/navigation.utils');
    const { NAV_ITEMS } = await import('@/config/navigation');
    const items = NAV_ITEMS.filter((i) => i.featureFlag === 'VITE_ENABLE_COMMUNICATION_TRACKING');
    expect(items.every((item) => !filterNavItem(item, { role: 'ADMIN' }))).toBe(true);
  });

  it('returns nav groups when flag is on', async () => {
    vi.stubEnv('VITE_ENABLE_COMMUNICATION_TRACKING', 'true');
    const { buildEtmsNavGroups } = await import('@/config/navigation.utils');
    const group = buildEtmsNavGroups().find((g) => g.id === 'communications');
    expect(group?.label).toBe('Communications');
    expect(group?.items.length).toBeGreaterThan(0);
  });

  it('uses strict true comparison', async () => {
    vi.stubEnv('VITE_ENABLE_COMMUNICATION_TRACKING', 'TRUE');
    const { isCommunicationTrackingEnabled } = await import('@/config/features');
    expect(isCommunicationTrackingEnabled).toBe(false);
  });

  it('communications route has element defined', async () => {
    vi.stubEnv('VITE_ENABLE_COMMUNICATION_TRACKING', 'true');
    const { communicationTrackingRoutes } = await import('../communication-tracking.routes');
    const route = communicationTrackingRoutes.find((r) => r.path === 'communications');
    expect(route?.element).toBeTruthy();
  });
});
