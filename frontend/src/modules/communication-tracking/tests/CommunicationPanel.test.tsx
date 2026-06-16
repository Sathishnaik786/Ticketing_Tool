import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CommunicationPanel } from '../components/CommunicationPanel';

vi.mock('../hooks/useCommunicationTracking', () => ({
  useTicketCommunications: vi.fn(),
}));

const { useTicketCommunications } = await import('../hooks/useCommunicationTracking');

function wrapper(children: React.ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('CommunicationPanel', () => {
  it('shows loading skeleton', () => {
    vi.mocked(useTicketCommunications).mockReturnValue({ isLoading: true } as never);
    const { container } = render(wrapper(<CommunicationPanel ticketId="t1" />));
    expect(container.firstChild).toBeTruthy();
  });

  it('shows empty state', () => {
    vi.mocked(useTicketCommunications).mockReturnValue({
      isLoading: false,
      data: { data: { communications: [], call_logs: [], email_logs: [] } },
    } as never);
    render(wrapper(<CommunicationPanel ticketId="t1" />));
    expect(screen.getByText(/No communications recorded yet/i)).toBeInTheDocument();
  });

  it('renders communication items', () => {
    vi.mocked(useTicketCommunications).mockReturnValue({
      isLoading: false,
      data: {
        data: {
          communications: [{
            id: 'c1',
            ticket_id: 't1',
            communication_type: 'COMMENT',
            direction: 'OUTBOUND',
            message: 'Hello world',
            created_by: 'e1',
            visibility: 'PUBLIC',
            created_at: '2026-06-15T10:00:00.000Z',
            updated_at: '2026-06-15T10:00:00.000Z',
          }],
          call_logs: [],
          email_logs: [],
        },
      },
    } as never);
    render(wrapper(<CommunicationPanel ticketId="t1" />));
    expect(screen.getByText('Hello world')).toBeInTheDocument();
    expect(screen.getByText('COMMENT')).toBeInTheDocument();
  });

  it('shows error state', () => {
    vi.mocked(useTicketCommunications).mockReturnValue({
      isLoading: false,
      isError: true,
      error: new Error('Failed'),
    } as never);
    render(wrapper(<CommunicationPanel ticketId="t1" />));
    expect(screen.getByRole('alert')).toHaveTextContent('Failed');
  });
});
