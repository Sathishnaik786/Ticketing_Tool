import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationList } from '../components/NotificationList';
import { NotificationAnalyticsWidgets } from '../components/NotificationAnalyticsWidgets';
import { UnreadBadge } from '../components/UnreadBadge';

vi.mock('../hooks/useNotificationCenter', () => ({
  useUnreadNotificationCount: vi.fn(),
}));

vi.mock('@/config/features', () => ({ isNotificationCenterEnabled: true }));

const { useUnreadNotificationCount } = await import('../hooks/useNotificationCenter');

describe('NotificationList', () => {
  it('empty state', () => {
    render(<NotificationList notifications={[]} />);
    expect(screen.getByText(/No notifications found/)).toBeInTheDocument();
  });

  it('loading state', () => {
    render(<NotificationList notifications={[]} isLoading />);
    expect(screen.getByText(/Loading notifications/)).toBeInTheDocument();
  });
});

describe('NotificationAnalyticsWidgets', () => {
  it('renders metrics', () => {
    render(<NotificationAnalyticsWidgets analytics={{ total: 5, unread: 1, readPct: 80, deliveryPct: 90, byModule: [], byPriority: [] }} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});

describe('UnreadBadge', () => {
  it('shows count', () => {
    vi.mocked(useUnreadNotificationCount).mockReturnValue({ data: 7 } as never);
    render(
      <MemoryRouter>
        <QueryClientProvider client={new QueryClient()}>
          <UnreadBadge />
        </QueryClientProvider>
      </MemoryRouter>
    );
    expect(screen.getByText('7')).toBeInTheDocument();
  });
});
