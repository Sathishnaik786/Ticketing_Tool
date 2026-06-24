import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/services/api', () => ({
  apiCall: vi.fn(),
}));

vi.mock('@/config/features', () => ({
  isApprovalEngineEnabled: true,
}));

describe('approvalManagementApi', () => {
  beforeEach(async () => {
    vi.resetModules();
    const { apiCall } = await import('@/services/api');
    vi.mocked(apiCall).mockReset();
  });

  it('getCatalog calls correct endpoint', async () => {
    const { apiCall } = await import('@/services/api');
    vi.mocked(apiCall).mockResolvedValue({ success: true, data: [] });
    const { approvalManagementApi } = await import('../services/approvalManagementService');
    await approvalManagementApi.getCatalog();
    expect(apiCall).toHaveBeenCalledWith('/approvals/catalog', 'GET', undefined);
  });

  it('createWorkflow posts payload', async () => {
    const { apiCall } = await import('@/services/api');
    vi.mocked(apiCall).mockResolvedValue({ success: true, data: {} });
    const { approvalManagementApi } = await import('../services/approvalManagementService');
    const payload = { name: 'Test', steps: [{ step_order: 1, step_name: 'M', approver_role: 'MANAGER' }] };
    await approvalManagementApi.createWorkflow(payload);
    expect(apiCall).toHaveBeenCalledWith('/approvals/workflow', 'POST', payload);
  });

  it('startTicketApproval posts to ticket endpoint', async () => {
    const { apiCall } = await import('@/services/api');
    vi.mocked(apiCall).mockResolvedValue({ success: true, data: {} });
    const { approvalManagementApi } = await import('../services/approvalManagementService');
    await approvalManagementApi.startTicketApproval('ticket-1', { workflow_id: 'wf-1' });
    expect(apiCall).toHaveBeenCalledWith('/approvals/ticket/ticket-1/start', 'POST', { workflow_id: 'wf-1' });
  });

  it('approveTicket posts to approve endpoint', async () => {
    const { apiCall } = await import('@/services/api');
    vi.mocked(apiCall).mockResolvedValue({ success: true, data: {} });
    const { approvalManagementApi } = await import('../services/approvalManagementService');
    await approvalManagementApi.approveTicket('ticket-1', { comments: 'OK' });
    expect(apiCall).toHaveBeenCalledWith('/approvals/ticket/ticket-1/approve', 'POST', { comments: 'OK' });
  });

  it('rejectTicket posts to reject endpoint', async () => {
    const { apiCall } = await import('@/services/api');
    vi.mocked(apiCall).mockResolvedValue({ success: true, data: {} });
    const { approvalManagementApi } = await import('../services/approvalManagementService');
    await approvalManagementApi.rejectTicket('ticket-1');
    expect(apiCall).toHaveBeenCalledWith('/approvals/ticket/ticket-1/reject', 'POST', {});
  });

  it('getPending calls pending endpoint', async () => {
    const { apiCall } = await import('@/services/api');
    vi.mocked(apiCall).mockResolvedValue({ success: true, data: [] });
    const { approvalManagementApi } = await import('../services/approvalManagementService');
    await approvalManagementApi.getPending();
    expect(apiCall).toHaveBeenCalledWith('/approvals/pending', 'GET', undefined);
  });

  it('getAnalytics calls analytics endpoint', async () => {
    const { apiCall } = await import('@/services/api');
    vi.mocked(apiCall).mockResolvedValue({ success: true, data: {} });
    const { approvalManagementApi } = await import('../services/approvalManagementService');
    await approvalManagementApi.getAnalytics();
    expect(apiCall).toHaveBeenCalledWith('/approvals/analytics', 'GET', undefined);
  });

  it('throws 503 when feature flag disabled', async () => {
    vi.doMock('@/config/features', () => ({ isApprovalEngineEnabled: false }));
    const { approvalManagementApi } = await import('../services/approvalManagementService');
    await expect(approvalManagementApi.getCatalog()).rejects.toMatchObject({ status: 503 });
  });
});
