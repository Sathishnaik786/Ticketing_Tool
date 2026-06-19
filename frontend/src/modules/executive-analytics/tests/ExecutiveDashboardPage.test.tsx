import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ExecutiveDashboardPage from '../pages/ExecutiveDashboardPage';

vi.mock('../hooks/useExecutiveAnalytics', () => ({
  useExecutiveDashboard: vi.fn(),
  useTrendAnalytics: vi.fn(),
  useCreateAnalyticsReport: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

const { useExecutiveDashboard, useTrendAnalytics } = await import('../hooks/useExecutiveAnalytics');

function wrapper(children: React.ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('ExecutiveDashboardPage', () => {
  it('renders title', () => {
    vi.mocked(useExecutiveDashboard).mockReturnValue({ isLoading: true } as never);
    vi.mocked(useTrendAnalytics).mockReturnValue({ isLoading: true } as never);
    render(wrapper(<ExecutiveDashboardPage />));
    expect(screen.getByText('Executive Dashboard')).toBeInTheDocument();
  });

  it('renders kpis', () => {
    vi.mocked(useExecutiveDashboard).mockReturnValue({
      isLoading: false,
      data: { kpis: { openTickets: 5, closedTickets: 3, totalTickets: 8, resolutionPct: 37, slaCompliancePct: 90, csatScore: 4, approvalTurnaroundHours: 1, knowledgeDeflectionPct: 0, averageResolutionHours: 2, escalationCount: 0, workloadDistribution: [] } },
    } as never);
    vi.mocked(useTrendAnalytics).mockReturnValue({ isLoading: false, data: { monthly: [] } } as never);
    render(wrapper(<ExecutiveDashboardPage />));
    expect(screen.getByText('Open Tickets')).toBeInTheDocument();
  });

  it('shows error state', () => {
    vi.mocked(useExecutiveDashboard).mockReturnValue({ isLoading: false, isError: true } as never);
    vi.mocked(useTrendAnalytics).mockReturnValue({ isLoading: false, data: { monthly: [] } } as never);
    render(wrapper(<ExecutiveDashboardPage />));
    expect(screen.getByText(/Unable to load executive dashboard/)).toBeInTheDocument();
  });
});
