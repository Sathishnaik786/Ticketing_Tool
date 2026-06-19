import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PendingApprovalsWidget } from '../components/PendingApprovalsWidget';

vi.mock('../hooks/useApprovalManagement', () => ({
  usePendingApprovals: vi.fn(),
}));

const { usePendingApprovals } = await import('../hooks/useApprovalManagement');

function wrapper(children: React.ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('PendingApprovalsWidget', () => {
  it('shows loading skeleton', () => {
    vi.mocked(usePendingApprovals).mockReturnValue({ isLoading: true } as never);
    const { container } = render(wrapper(<PendingApprovalsWidget />));
    expect(container.firstChild).toBeTruthy();
  });

  it('shows empty state', () => {
    vi.mocked(usePendingApprovals).mockReturnValue({ isLoading: false, data: [] } as never);
    render(wrapper(<PendingApprovalsWidget />));
    expect(screen.getByText(/No approvals awaiting your action/)).toBeInTheDocument();
  });

  it('renders pending approval cards', () => {
    vi.mocked(usePendingApprovals).mockReturnValue({
      isLoading: false,
      data: [{
        id: 'a1',
        ticket_id: '550e8400-e29b-41d4-a716-446655440001',
        workflow_id: 'wf1',
        status: 'PENDING',
        started_by: 'e1',
        started_at: '2026-06-15T10:00:00.000Z',
        created_at: '2026-06-15T10:00:00.000Z',
      }],
    } as never);
    render(wrapper(<PendingApprovalsWidget />));
    expect(screen.getByText('PENDING')).toBeInTheDocument();
  });
});
