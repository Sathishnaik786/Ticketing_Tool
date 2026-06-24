import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NotificationAnalyticsPage from '../pages/NotificationAnalyticsPage';

vi.mock('../hooks/useNotificationCenter', () => ({
  useNotificationAnalytics: vi.fn(),
}));

const { useNotificationAnalytics } = await import('../hooks/useNotificationCenter');

function wrapper(children: React.ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('NotificationAnalyticsPage', () => {
  it('renders title', () => {
    vi.mocked(useNotificationAnalytics).mockReturnValue({ isLoading: true } as never);
    render(wrapper(<NotificationAnalyticsPage />));
    expect(screen.getByText('Notification Analytics')).toBeInTheDocument();
  });

  it('renders widgets', () => {
    vi.mocked(useNotificationAnalytics).mockReturnValue({
      isLoading: false,
      data: { total: 10, unread: 2, readPct: 80, deliveryPct: 95, byModule: [{ module: 'ticketing', count: 5 }], byPriority: [{ priority: 'HIGH', count: 1 }] },
    } as never);
    render(wrapper(<NotificationAnalyticsPage />));
    expect(screen.getByText('Total Notifications')).toBeInTheDocument();
    expect(screen.getByText('ticketing')).toBeInTheDocument();
  });

  it('shows error state', () => {
    vi.mocked(useNotificationAnalytics).mockReturnValue({ isLoading: false, isError: true } as never);
    render(wrapper(<NotificationAnalyticsPage />));
    expect(screen.getByText(/Unable to load notification analytics/)).toBeInTheDocument();
  });
});
