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
    const { ticketAssignmentNavGroups } = await import('../ticket-assignment.nav');
    expect(ticketAssignmentNavGroups).toEqual([]);
  });

  it('returns nav groups when flag is on', async () => {
    vi.stubEnv('VITE_ENABLE_TICKET_ASSIGNMENTS', 'true');
    const { ticketAssignmentNavGroups } = await import('../ticket-assignment.nav');
    expect(ticketAssignmentNavGroups[0]?.label).toBe('Work Queues');
    expect(ticketAssignmentNavGroups[0]?.items?.length).toBe(3);
  });

  it('uses strict true comparison', async () => {
    vi.stubEnv('VITE_ENABLE_TICKET_ASSIGNMENTS', 'TRUE');
    const { isTicketAssignmentsEnabled } = await import('@/config/features');
    expect(isTicketAssignmentsEnabled).toBe(false);
  });

  it('restricts team queue nav to manager roles', async () => {
    vi.stubEnv('VITE_ENABLE_TICKET_ASSIGNMENTS', 'true');
    const { ticketAssignmentNavGroups } = await import('../ticket-assignment.nav');
    const teamItem = ticketAssignmentNavGroups[0]?.items?.find((i) => i.title === 'Team Queue');
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
