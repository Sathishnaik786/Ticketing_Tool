import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CommunicationAnalyticsWidget } from '../components/CommunicationAnalyticsWidget';

vi.mock('../hooks/useCommunicationTracking', () => ({
  useCommunicationAnalytics: vi.fn(),
}));

const { useCommunicationAnalytics } = await import('../hooks/useCommunicationTracking');

function wrapper(children: React.ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('CommunicationAnalyticsWidget', () => {
  it('renders metric cards', () => {
    vi.mocked(useCommunicationAnalytics).mockReturnValue({
      isLoading: false,
      data: {
        data: {
          totalCommunications: 10,
          callsLogged: 3,
          emailsSent: 4,
          commentsAdded: 5,
          averageResponseTimeMinutes: 12,
        },
      },
    } as never);
    render(wrapper(<CommunicationAnalyticsWidget />));
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('shows unavailable on error', () => {
    vi.mocked(useCommunicationAnalytics).mockReturnValue({ isLoading: false, isError: true } as never);
    render(wrapper(<CommunicationAnalyticsWidget />));
    expect(screen.getByText(/Analytics unavailable/i)).toBeInTheDocument();
  });
});
