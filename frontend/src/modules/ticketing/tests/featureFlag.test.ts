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
    const { ticketingNavGroups } = await import('../ticketing.nav');
    expect(ticketingNavGroups).toEqual([]);
  });

  it('returns sidebar groups when flag is on', async () => {
    vi.stubEnv('VITE_ENABLE_TICKETING', 'true');
    const { ticketingNavGroups } = await import('../ticketing.nav');
    expect(ticketingNavGroups).toHaveLength(1);
    expect(ticketingNavGroups[0]?.label).toBe('Service Management');
    expect(ticketingNavGroups[0]?.items).toHaveLength(2);
  });

  it('uses strict true comparison in features config', async () => {
    vi.stubEnv('VITE_ENABLE_TICKETING', 'TRUE');
    const { isTicketingEnabled } = await import('@/config/features');
    expect(isTicketingEnabled).toBe(false);
  });
});
