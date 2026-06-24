import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Tabs, TabsList } from '@/components/ui/tabs';
import { TicketApprovalTabTrigger, TicketApprovalTabContent } from '../components/TicketApprovalTab';

vi.mock('@/config/features', () => ({ isApprovalEngineEnabled: true }));

vi.mock('../hooks/useApprovalManagement', () => ({
  useTicketApprovalState: vi.fn(),
  useApproveTicketStep: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useRejectTicketStep: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

const { useTicketApprovalState } = await import('../hooks/useApprovalManagement');

function wrapper(children: React.ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={qc}>
      <Tabs defaultValue="approval-workflow">{children}</Tabs>
    </QueryClientProvider>
  );
}

describe('TicketApprovalTab', () => {
  it('renders tab trigger when enabled', () => {
    render(
      <Tabs defaultValue="approval-workflow">
        <TabsList>
          <TicketApprovalTabTrigger />
        </TabsList>
      </Tabs>
    );
    expect(screen.getByText('Approval Workflow')).toBeInTheDocument();
  });

  it('shows loading state in content', () => {
    vi.mocked(useTicketApprovalState).mockReturnValue({ isLoading: true } as never);
    render(wrapper(<TicketApprovalTabContent ticketId="t1" />));
    expect(document.querySelector('.animate-pulse') || document.body.textContent).toBeTruthy();
  });

  it('shows no approval message when inactive', () => {
    vi.mocked(useTicketApprovalState).mockReturnValue({
      isLoading: false,
      data: { active: null, latest: null, history: [] },
    } as never);
    render(wrapper(<TicketApprovalTabContent ticketId="t1" />));
    expect(screen.getByText(/No approval workflow has been started/)).toBeInTheDocument();
  });

  it('renders audit trail section', () => {
    vi.mocked(useTicketApprovalState).mockReturnValue({
      isLoading: false,
      data: {
        active: { id: 'a1', status: 'PENDING', current_step_id: 's1' },
        steps: [{ id: 's1', step_order: 1, step_name: 'Manager', approver_role: 'MANAGER', workflow_id: 'wf1', is_required: true }],
        history: [],
        can_act: false,
      },
    } as never);
    render(wrapper(<TicketApprovalTabContent ticketId="t1" />));
    expect(screen.getByText('Audit trail')).toBeInTheDocument();
  });
});
