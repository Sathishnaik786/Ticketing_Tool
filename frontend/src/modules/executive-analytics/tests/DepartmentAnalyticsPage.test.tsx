import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DepartmentAnalyticsPage from '../pages/DepartmentAnalyticsPage';

vi.mock('../hooks/useExecutiveAnalytics', () => ({
  useDepartmentAnalytics: vi.fn(),
}));

const { useDepartmentAnalytics } = await import('../hooks/useExecutiveAnalytics');

function wrapper(children: React.ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('DepartmentAnalyticsPage', () => {
  it('renders title', () => {
    vi.mocked(useDepartmentAnalytics).mockReturnValue({ isLoading: true } as never);
    render(wrapper(<DepartmentAnalyticsPage />));
    expect(screen.getByText('Department Analytics')).toBeInTheDocument();
  });

  it('renders scorecards', () => {
    vi.mocked(useDepartmentAnalytics).mockReturnValue({
      isLoading: false,
      data: { scorecards: [{ departmentId: 'd1', departmentName: 'IT', ticketVolume: 5, metrics: { slaCompliancePct: 90, csatScore: 4, escalations: 1, resolutionTimeHours: 2 } }] },
    } as never);
    render(wrapper(<DepartmentAnalyticsPage />));
    expect(screen.getByText('IT')).toBeInTheDocument();
  });
});
