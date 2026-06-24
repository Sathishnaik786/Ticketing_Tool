import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/services/api', () => ({ apiCall: vi.fn() }));
vi.mock('@/config/features', () => ({ isExecutiveAnalyticsEnabled: true }));

describe('executiveAnalyticsApi', () => {
  beforeEach(async () => {
    vi.resetModules();
    const { apiCall } = await import('@/services/api');
    vi.mocked(apiCall).mockReset();
  });

  it('getExecutiveDashboard', async () => {
    const { apiCall } = await import('@/services/api');
    vi.mocked(apiCall).mockResolvedValue({ success: true, data: {} });
    const { executiveAnalyticsApi } = await import('../services/executiveAnalyticsService');
    await executiveAnalyticsApi.getExecutiveDashboard();
    expect(apiCall).toHaveBeenCalledWith('/analytics/executive-dashboard', 'GET', undefined);
  });

  it('getDepartmentDashboard', async () => {
    const { apiCall } = await import('@/services/api');
    vi.mocked(apiCall).mockResolvedValue({ success: true, data: {} });
    const { executiveAnalyticsApi } = await import('../services/executiveAnalyticsService');
    await executiveAnalyticsApi.getDepartmentDashboard();
    expect(apiCall).toHaveBeenCalledWith('/analytics/department-dashboard', 'GET', undefined);
  });

  it('getBusinessUnitDashboard', async () => {
    const { apiCall } = await import('@/services/api');
    vi.mocked(apiCall).mockResolvedValue({ success: true, data: {} });
    const { executiveAnalyticsApi } = await import('../services/executiveAnalyticsService');
    await executiveAnalyticsApi.getBusinessUnitDashboard();
    expect(apiCall).toHaveBeenCalledWith('/analytics/business-unit-dashboard', 'GET', undefined);
  });

  it('getTrends', async () => {
    const { apiCall } = await import('@/services/api');
    vi.mocked(apiCall).mockResolvedValue({ success: true, data: { monthly: [] } });
    const { executiveAnalyticsApi } = await import('../services/executiveAnalyticsService');
    await executiveAnalyticsApi.getTrends();
    expect(apiCall).toHaveBeenCalledWith('/analytics/trends', 'GET', undefined);
  });

  it('createReport posts payload', async () => {
    const { apiCall } = await import('@/services/api');
    vi.mocked(apiCall).mockResolvedValue({ success: true, data: {} });
    const { executiveAnalyticsApi } = await import('../services/executiveAnalyticsService');
    await executiveAnalyticsApi.createReport({ name: 'R', report_type: 'TREND', format: 'CSV' });
    expect(apiCall).toHaveBeenCalledWith('/analytics/reports', 'POST', expect.objectContaining({ name: 'R' }));
  });

  it('503 when disabled', async () => {
    vi.doMock('@/config/features', () => ({ isExecutiveAnalyticsEnabled: false }));
    const { executiveAnalyticsApi } = await import('../services/executiveAnalyticsService');
    await expect(executiveAnalyticsApi.getCsat()).rejects.toMatchObject({ status: 503 });
  });
});
