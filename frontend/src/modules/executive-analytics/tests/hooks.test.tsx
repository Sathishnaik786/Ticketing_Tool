import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

vi.mock('../services/executiveAnalyticsService', () => ({
  executiveAnalyticsApi: {
    getExecutiveDashboard: vi.fn(),
    getDepartmentDashboard: vi.fn(),
    getBusinessUnitDashboard: vi.fn(),
    getTrends: vi.fn(),
    listReports: vi.fn(),
    createReport: vi.fn(),
  },
}));

const api = await import('../services/executiveAnalyticsService');

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe('useExecutiveAnalytics hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useExecutiveDashboard fetches data', async () => {
    vi.mocked(api.executiveAnalyticsApi.getExecutiveDashboard).mockResolvedValue({ success: true, data: { kpis: {} } } as never);
    const { useExecutiveDashboard } = await import('../hooks/useExecutiveAnalytics');
    const { result } = renderHook(() => useExecutiveDashboard(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('useDepartmentAnalytics fetches data', async () => {
    vi.mocked(api.executiveAnalyticsApi.getDepartmentDashboard).mockResolvedValue({ success: true, data: { scorecards: [] } } as never);
    const { useDepartmentAnalytics } = await import('../hooks/useExecutiveAnalytics');
    const { result } = renderHook(() => useDepartmentAnalytics(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('useBusinessUnitAnalytics fetches data', async () => {
    vi.mocked(api.executiveAnalyticsApi.getBusinessUnitDashboard).mockResolvedValue({ success: true, data: { scorecards: [] } } as never);
    const { useBusinessUnitAnalytics } = await import('../hooks/useExecutiveAnalytics');
    const { result } = renderHook(() => useBusinessUnitAnalytics(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('useTrendAnalytics fetches data', async () => {
    vi.mocked(api.executiveAnalyticsApi.getTrends).mockResolvedValue({ success: true, data: { monthly: [] } } as never);
    const { useTrendAnalytics } = await import('../hooks/useExecutiveAnalytics');
    const { result } = renderHook(() => useTrendAnalytics(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('useAnalyticsReports fetches data', async () => {
    vi.mocked(api.executiveAnalyticsApi.listReports).mockResolvedValue({ success: true, data: [] } as never);
    const { useAnalyticsReports } = await import('../hooks/useExecutiveAnalytics');
    const { result } = renderHook(() => useAnalyticsReports(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
