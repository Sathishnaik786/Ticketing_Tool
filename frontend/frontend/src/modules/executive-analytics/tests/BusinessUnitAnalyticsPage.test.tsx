import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BusinessUnitAnalyticsPage from '../pages/BusinessUnitAnalyticsPage';

vi.mock('../hooks/useExecutiveAnalytics', () => ({
  useBusinessUnitAnalytics: vi.fn(),
}));

const { useBusinessUnitAnalytics } = await import('../hooks/useExecutiveAnalytics');

function wrapper(children: React.ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('BusinessUnitAnalyticsPage', () => {
  it('renders title', () => {
    vi.mocked(useBusinessUnitAnalytics).mockReturnValue({ isLoading: true } as never);
    render(wrapper(<BusinessUnitAnalyticsPage />));
    expect(screen.getByText('Business Unit Analytics')).toBeInTheDocument();
  });

  it('renders scorecards', () => {
    vi.mocked(useBusinessUnitAnalytics).mockReturnValue({
      isLoading: false,
      data: { scorecards: [{ businessUnit: 'Aparna Realty', ticketCount: 20, slaCompliancePct: 92, csatScore: 4.3, approvalTurnaroundHours: 12, resolutionTrend: 75 }] },
    } as never);
    render(wrapper(<BusinessUnitAnalyticsPage />));
    expect(screen.getByText('Aparna Realty')).toBeInTheDocument();
  });

  it('shows error state', () => {
    vi.mocked(useBusinessUnitAnalytics).mockReturnValue({ isLoading: false, isError: true } as never);
    render(wrapper(<BusinessUnitAnalyticsPage />));
    expect(screen.getByText(/Unable to load business unit analytics/)).toBeInTheDocument();
  });
});
