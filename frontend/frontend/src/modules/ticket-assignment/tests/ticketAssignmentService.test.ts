import { describe, it, expect, vi } from 'vitest';

describe('ticketAssignmentService', () => {
  it('blocks API when feature flag is off', async () => {
    vi.resetModules();
    vi.doMock('@/config/features', () => ({ isTicketAssignmentsEnabled: false }));
    vi.doMock('@/services/api', () => ({ apiCall: vi.fn() }));
    const { ticketAssignmentApi } = await import('../services/ticketAssignmentService');
    await expect(ticketAssignmentApi.getMyQueue()).rejects.toMatchObject({ status: 503 });
  });
});
