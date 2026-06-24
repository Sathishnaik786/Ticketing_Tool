import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('ticket feedback feature flag', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('returns no routes when flag is off', async () => {
    vi.stubEnv('VITE_ENABLE_TICKET_FEEDBACK', 'false');
    const { ticketFeedbackRoutes } = await import('../ticket-feedback.routes');
    expect(ticketFeedbackRoutes).toEqual([]);
  });

  it('returns routes when flag is on', async () => {
    vi.stubEnv('VITE_ENABLE_TICKET_FEEDBACK', 'true');
    const { ticketFeedbackRoutes } = await import('../ticket-feedback.routes');
    expect(ticketFeedbackRoutes).toHaveLength(1);
    expect(ticketFeedbackRoutes[0]?.path).toBe('feedback-analytics');
  });

  it('returns no nav groups when flag is off', async () => {
    vi.stubEnv('VITE_ENABLE_TICKET_FEEDBACK', 'false');
    const { filterNavItem } = await import('@/config/navigation.utils');
    const { NAV_ITEMS } = await import('@/config/navigation');
    const items = NAV_ITEMS.filter((i) => i.featureFlag === 'VITE_ENABLE_TICKET_FEEDBACK');
    expect(items.every((item) => !filterNavItem(item, { role: 'ADMIN' }))).toBe(true);
  });

  it('returns nav groups when flag is on', async () => {
    vi.stubEnv('VITE_ENABLE_TICKET_FEEDBACK', 'true');
    const { buildEtmsNavGroups } = await import('@/config/navigation.utils');
    const group = buildEtmsNavGroups().find((g) => g.id === 'feedback');
    expect(group?.items?.[0]?.title).toBe('Feedback Analytics');
  });

  it('uses strict true comparison in features config', async () => {
    vi.stubEnv('VITE_ENABLE_TICKET_FEEDBACK', 'TRUE');
    const { isTicketFeedbackEnabled } = await import('@/config/features');
    expect(isTicketFeedbackEnabled).toBe(false);
  });
});
