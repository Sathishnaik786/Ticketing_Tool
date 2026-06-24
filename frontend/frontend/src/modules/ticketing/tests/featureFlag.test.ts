import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('ticketing feature flag', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('returns no routes when flag is off', async () => {
    vi.stubEnv('VITE_ENABLE_TICKETING', 'false');
    const { ticketingRoutes } = await import('../ticketing.routes');
    expect(ticketingRoutes).toEqual([]);
  });

  it('returns routes when flag is on', async () => {
    vi.stubEnv('VITE_ENABLE_TICKETING', 'true');
    const { ticketingRoutes } = await import('../ticketing.routes');
    expect(ticketingRoutes.length).toBeGreaterThan(0);
    expect(ticketingRoutes[0]?.path).toBe('tickets');
  });

  it('returns no sidebar groups when flag is off', async () => {
    vi.stubEnv('VITE_ENABLE_TICKETING', 'false');
    const { filterNavItem } = await import('@/config/navigation.utils');
    const { NAV_ITEMS } = await import('@/config/navigation');
    const items = NAV_ITEMS.filter((i) => i.featureFlag === 'VITE_ENABLE_TICKETING');
    expect(items.every((item) => !filterNavItem(item, { role: 'ADMIN' }))).toBe(true);
  });

  it('returns sidebar groups when flag is on', async () => {
    vi.stubEnv('VITE_ENABLE_TICKETING', 'true');
    const { buildEtmsNavGroups } = await import('@/config/navigation.utils');
    const group = buildEtmsNavGroups().find((g) => g.id === 'tickets');
    expect(group?.label).toBe('Tickets');
    expect(group?.items.length).toBeGreaterThan(0);
  });

  it('uses strict true comparison in features config', async () => {
    vi.stubEnv('VITE_ENABLE_TICKETING', 'TRUE');
    const { isTicketingEnabled } = await import('@/config/features');
    expect(isTicketingEnabled).toBe(false);
  });
});
