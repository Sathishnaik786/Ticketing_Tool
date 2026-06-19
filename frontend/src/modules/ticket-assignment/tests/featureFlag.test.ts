import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('ticket assignment feature flag', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('returns no routes when flag is off', async () => {
    vi.stubEnv('VITE_ENABLE_TICKET_ASSIGNMENTS', 'false');
    const { ticketAssignmentRoutes } = await import('../ticket-assignment.routes');
    expect(ticketAssignmentRoutes).toEqual([]);
  });

  it('returns routes when flag is on', async () => {
    vi.stubEnv('VITE_ENABLE_TICKET_ASSIGNMENTS', 'true');
    const { ticketAssignmentRoutes } = await import('../ticket-assignment.routes');
    expect(ticketAssignmentRoutes.length).toBe(3);
    expect(ticketAssignmentRoutes.map((r) => r.path)).toEqual([
      'my-queue',
      'team-queue',
      'assignment-analytics',
    ]);
  });

  it('returns no nav when flag is off', async () => {
    vi.stubEnv('VITE_ENABLE_TICKET_ASSIGNMENTS', 'false');
    const { filterNavItem } = await import('@/config/navigation.utils');
    const { NAV_ITEMS } = await import('@/config/navigation');
    const items = NAV_ITEMS.filter((i) => i.featureFlag === 'VITE_ENABLE_TICKET_ASSIGNMENTS');
    expect(items.every((item) => !filterNavItem(item, { role: 'ADMIN' }))).toBe(true);
  });

  it('returns nav groups when flag is on', async () => {
    vi.stubEnv('VITE_ENABLE_TICKET_ASSIGNMENTS', 'true');
    const { buildEtmsNavGroups } = await import('@/config/navigation.utils');
    const group = buildEtmsNavGroups().find((g) => g.id === 'assignments');
    expect(group?.label).toBe('Assignments');
    expect(group?.items.length).toBeGreaterThan(0);
  });

  it('uses strict true comparison', async () => {
    vi.stubEnv('VITE_ENABLE_TICKET_ASSIGNMENTS', 'TRUE');
    const { isTicketAssignmentsEnabled } = await import('@/config/features');
    expect(isTicketAssignmentsEnabled).toBe(false);
  });

  it('restricts team queue nav to manager roles', async () => {
    vi.stubEnv('VITE_ENABLE_TICKET_ASSIGNMENTS', 'true');
    const { NAV_ITEMS } = await import('@/config/navigation');
    const teamItem = NAV_ITEMS.find((i) => i.id === 'assignments-team');
    expect(teamItem?.roles).toEqual(['ADMIN', 'HR', 'MANAGER']);
  });

  it('returns assignment analytics route when flag is on', async () => {
    vi.stubEnv('VITE_ENABLE_TICKET_ASSIGNMENTS', 'true');
    const { ticketAssignmentRoutes } = await import('../ticket-assignment.routes');
    expect(ticketAssignmentRoutes.some((r) => r.path === 'assignment-analytics')).toBe(true);
  });

  it('my-queue route has element defined', async () => {
    vi.stubEnv('VITE_ENABLE_TICKET_ASSIGNMENTS', 'true');
    const { ticketAssignmentRoutes } = await import('../ticket-assignment.routes');
    const route = ticketAssignmentRoutes.find((r) => r.path === 'my-queue');
    expect(route?.element).toBeTruthy();
  });
});
