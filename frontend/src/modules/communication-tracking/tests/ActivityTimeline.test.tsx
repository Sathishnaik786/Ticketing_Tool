import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ActivityTimeline } from '../components/ActivityTimeline';

vi.mock('../hooks/useCommunicationTracking', () => ({
  useTicketActivityTimeline: vi.fn(),
}));

const { useTicketActivityTimeline } = await import('../hooks/useCommunicationTracking');

function wrapper(children: React.ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('ActivityTimeline', () => {
  it('shows empty state', () => {
    vi.mocked(useTicketActivityTimeline).mockReturnValue({
      isLoading: false,
      data: { data: { events: [] } },
    } as never);
    render(wrapper(<ActivityTimeline ticketId="t1" />));
    expect(screen.getByText(/No activity events yet/i)).toBeInTheDocument();
  });

  it('renders timeline events', () => {
    vi.mocked(useTicketActivityTimeline).mockReturnValue({
      isLoading: false,
      data: {
        data: {
          events: [{
            id: 'e1',
            ticket_id: 't1',
            event_type: 'COMMENT_ADDED',
            event_data: { communication_id: 'c1' },
            created_at: '2026-06-15T10:00:00.000Z',
          }],
        },
      },
    } as never);
    render(wrapper(<ActivityTimeline ticketId="t1" />));
    expect(screen.getByText(/COMMENT ADDED/i)).toBeInTheDocument();
  });

  it('shows integrated badge', () => {
    vi.mocked(useTicketActivityTimeline).mockReturnValue({
      isLoading: false,
      data: {
        data: {
          events: [{
            id: 'e2',
            ticket_id: 't1',
            event_type: 'ASSIGNED',
            event_data: {},
            created_at: '2026-06-15T10:00:00.000Z',
            integrated: true,
          }],
        },
      },
    } as never);
    render(wrapper(<ActivityTimeline ticketId="t1" />));
    expect(screen.getByText('Integrated')).toBeInTheDocument();
  });
});
