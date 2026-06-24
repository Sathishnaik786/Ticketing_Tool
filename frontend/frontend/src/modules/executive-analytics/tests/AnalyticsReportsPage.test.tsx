import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AnalyticsReportsPage from '../pages/AnalyticsReportsPage';

vi.mock('../hooks/useExecutiveAnalytics', () => ({
  useAnalyticsReports: vi.fn(),
  useCreateAnalyticsReport: vi.fn(),
}));

const { useAnalyticsReports, useCreateAnalyticsReport } = await import('../hooks/useExecutiveAnalytics');

function wrapper(children: React.ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('AnalyticsReportsPage', () => {
  it('renders title', () => {
    vi.mocked(useAnalyticsReports).mockReturnValue({ isLoading: true } as never);
    vi.mocked(useCreateAnalyticsReport).mockReturnValue({ mutate: vi.fn(), isPending: false } as never);
    render(wrapper(<AnalyticsReportsPage />));
    expect(screen.getByText('Analytics Reports')).toBeInTheDocument();
  });

  it('lists reports', () => {
    vi.mocked(useAnalyticsReports).mockReturnValue({
      isLoading: false,
      data: [{ id: 'r1', name: 'Monthly Trend', report_type: 'TREND', format: 'CSV', created_at: '2026-01-01' }],
    } as never);
    vi.mocked(useCreateAnalyticsReport).mockReturnValue({ mutate: vi.fn(), isPending: false } as never);
    render(wrapper(<AnalyticsReportsPage />));
    expect(screen.getByText('Monthly Trend')).toBeInTheDocument();
  });

  it('submits new report via export', async () => {
    const mutate = vi.fn();
    vi.mocked(useAnalyticsReports).mockReturnValue({ isLoading: false, data: [] } as never);
    vi.mocked(useCreateAnalyticsReport).mockReturnValue({ mutate, isPending: false } as never);
    render(wrapper(<AnalyticsReportsPage />));
    await userEvent.click(screen.getByRole('button', { name: 'CSV' }));
    expect(mutate).toHaveBeenCalled();
  });
});
