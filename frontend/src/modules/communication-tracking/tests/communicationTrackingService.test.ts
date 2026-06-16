import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/services/api', () => ({
  apiCall: vi.fn(),
}));

vi.mock('@/config/features', () => ({
  isCommunicationTrackingEnabled: true,
}));

describe('communicationTrackingApi', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { apiCall } = await import('@/services/api');
    vi.mocked(apiCall).mockResolvedValue({ success: true });
  });

  it('addComment calls correct endpoint', async () => {
    const { apiCall } = await import('@/services/api');
    const { communicationTrackingApi } = await import('../services/communicationTrackingService');
    await communicationTrackingApi.addComment({ ticket_id: 't1', message: 'hi' });
    expect(apiCall).toHaveBeenCalledWith('/communications/comment', 'POST', { ticket_id: 't1', message: 'hi' });
  });

  it('getByTicket calls GET endpoint', async () => {
    const { apiCall } = await import('@/services/api');
    const { communicationTrackingApi } = await import('../services/communicationTrackingService');
    await communicationTrackingApi.getByTicket('ticket-1');
    expect(apiCall).toHaveBeenLastCalledWith('/communications/ticket/ticket-1', 'GET', undefined);
  });

  it('getTimeline calls timeline endpoint', async () => {
    const { apiCall } = await import('@/services/api');
    const { communicationTrackingApi } = await import('../services/communicationTrackingService');
    await communicationTrackingApi.getTimeline('ticket-1');
    expect(apiCall).toHaveBeenLastCalledWith('/communications/timeline/ticket-1', 'GET', undefined);
  });

  it('getAnalytics appends query string', async () => {
    const { apiCall } = await import('@/services/api');
    const { communicationTrackingApi } = await import('../services/communicationTrackingService');
    await communicationTrackingApi.getAnalytics({ from: '2026-01-01', to: '2026-06-01' });
    expect(apiCall).toHaveBeenLastCalledWith('/communications/analytics?from=2026-01-01&to=2026-06-01', 'GET', undefined);
  });
});

describe('communicationTrackingApi disabled', () => {
  it('throws 503 when module disabled', async () => {
    vi.resetModules();
    vi.doMock('@/config/features', () => ({ isCommunicationTrackingEnabled: false }));
    const { communicationTrackingApi } = await import('../services/communicationTrackingService');
    await expect(communicationTrackingApi.addComment({ ticket_id: 't1', message: 'x' })).rejects.toMatchObject({ status: 503 });
  });
});
