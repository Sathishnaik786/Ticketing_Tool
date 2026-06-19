import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ApprovalAnalyticsPage from '../pages/ApprovalAnalyticsPage';

vi.mock('../hooks/useApprovalManagement', () => ({
  useApprovalAnalytics: vi.fn(),
}));

const { useApprovalAnalytics } = await import('../hooks/useApprovalManagement');

function wrapper(children: React.ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('ApprovalAnalyticsPage', () => {
  it('renders page title', () => {
    vi.mocked(useApprovalAnalytics).mockReturnValue({ isLoading: true } as never);
    render(wrapper(<ApprovalAnalyticsPage />));
    expect(screen.getByText('Approval Analytics')).toBeInTheDocument();
  });

  it('shows error state', () => {
    vi.mocked(useApprovalAnalytics).mockReturnValue({ isLoading: false, isError: true } as never);
    render(wrapper(<ApprovalAnalyticsPage />));
    expect(screen.getByText(/Unable to load approval analytics/)).toBeInTheDocument();
  });

  it('renders analytics metrics', () => {
    vi.mocked(useApprovalAnalytics).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { totalApprovals: 10, pendingCount: 3, statusCounts: { APPROVED: 5, PENDING: 3 } },
    } as never);
    render(wrapper(<ApprovalAnalyticsPage />));
    expect(screen.getByText('Total approvals').closest('div')?.textContent).toContain('10');
    expect(screen.getByText('Pending').closest('div')?.textContent).toContain('3');
    expect(screen.getByText('Approved').closest('div')?.textContent).toContain('5');
  });
});
