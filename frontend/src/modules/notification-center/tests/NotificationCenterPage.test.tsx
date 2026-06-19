import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NotificationCenterPage from '../pages/NotificationCenterPage';

vi.mock('../hooks/useNotificationCenter', () => ({
  useMyNotifications: vi.fn(),
  useMarkNotificationRead: vi.fn(() => ({ mutate: vi.fn() })),
  useMarkAllNotificationsRead: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useNotificationPreferences: vi.fn(),
  useUpdateNotificationPreferences: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

const { useMyNotifications, useNotificationPreferences } = await import('../hooks/useNotificationCenter');

function wrapper(children: React.ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <MemoryRouter>
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    </MemoryRouter>
  );
}

describe('NotificationCenterPage', () => {
  it('renders title', () => {
    vi.mocked(useMyNotifications).mockReturnValue({ isLoading: true } as never);
    vi.mocked(useNotificationPreferences).mockReturnValue({ isLoading: true } as never);
    render(wrapper(<NotificationCenterPage />));
    expect(screen.getByText('Notification Center')).toBeInTheDocument();
  });

  it('renders notifications', () => {
    vi.mocked(useMyNotifications).mockReturnValue({
      isLoading: false,
      data: { notifications: [{ id: 'n1', title: 'Alert', message: 'Msg', event_type: 'T', source_module: 'ticketing', priority: 'NORMAL', is_read: false, created_at: '2026-01-01' }] },
    } as never);
    vi.mocked(useNotificationPreferences).mockReturnValue({
      isLoading: false,
      data: { in_app_enabled: true, email_enabled: true, sms_enabled: false, push_enabled: false },
    } as never);
    render(wrapper(<NotificationCenterPage />));
    expect(screen.getByText('Alert')).toBeInTheDocument();
  });

  it('shows error state', () => {
    vi.mocked(useMyNotifications).mockReturnValue({ isLoading: false, isError: true } as never);
    vi.mocked(useNotificationPreferences).mockReturnValue({ isLoading: false } as never);
    render(wrapper(<NotificationCenterPage />));
    expect(screen.getByText(/Unable to load notifications/)).toBeInTheDocument();
  });
});
