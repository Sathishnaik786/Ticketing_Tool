import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MyApprovalsPage from '../pages/MyApprovalsPage';

vi.mock('../hooks/useApprovalManagement', () => ({
  useMyApprovals: vi.fn(),
  usePendingApprovals: vi.fn(),
}));

const { useMyApprovals, usePendingApprovals } = await import('../hooks/useApprovalManagement');

function wrapper(children: React.ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('MyApprovalsPage', () => {
  it('renders page title', () => {
    vi.mocked(useMyApprovals).mockReturnValue({ isLoading: false, data: [] } as never);
    vi.mocked(usePendingApprovals).mockReturnValue({ isLoading: false, data: [] } as never);
    render(wrapper(<MyApprovalsPage />));
    expect(screen.getByText('My Approvals')).toBeInTheDocument();
  });

  it('shows pending empty state', () => {
    vi.mocked(useMyApprovals).mockReturnValue({ isLoading: false, data: [] } as never);
    vi.mocked(usePendingApprovals).mockReturnValue({ isLoading: false, data: [] } as never);
    render(wrapper(<MyApprovalsPage />));
    expect(screen.getByText(/No pending approvals assigned to you/)).toBeInTheDocument();
  });

  it('shows submitted empty state on second tab', async () => {
    vi.mocked(useMyApprovals).mockReturnValue({ isLoading: false, data: [] } as never);
    vi.mocked(usePendingApprovals).mockReturnValue({ isLoading: false, data: [] } as never);
    render(wrapper(<MyApprovalsPage />));
    await userEvent.click(screen.getByText('My submissions'));
    expect(await screen.findByText(/You have not submitted any approval requests/)).toBeInTheDocument();
  });
});
