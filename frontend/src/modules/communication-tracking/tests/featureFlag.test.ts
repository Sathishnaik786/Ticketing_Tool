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
    const { communicationTrackingNavGroups } = await import('../communication-tracking.nav');
    expect(communicationTrackingNavGroups).toEqual([]);
  });

  it('returns nav groups when flag is on', async () => {
    vi.stubEnv('VITE_ENABLE_COMMUNICATION_TRACKING', 'true');
    const { communicationTrackingNavGroups } = await import('../communication-tracking.nav');
    expect(communicationTrackingNavGroups[0]?.label).toBe('Communications');
    expect(communicationTrackingNavGroups[0]?.items?.length).toBe(3);
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
