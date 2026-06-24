import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NotificationCenterPage from '../pages/NotificationCenterPage';

// Mock Auth Context
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({ user: { id: 'user-123', firstName: 'John', role: 'ADMIN' } })),
}));

// Mock feature flag config
vi.mock('@/config/features', () => ({
  isEtmsNotificationsEnabled: true,
  isNotificationCenterEnabled: true,
}));

// Mock Notification API endpoints
vi.mock('../hooks/useNotificationCenter', () => ({
  useMyNotifications: vi.fn(() => ({
    data: {
      notifications: [
        { id: '1', title: 'Ticket Assigned', message: 'TKT-104 has been assigned to you', source_module: 'ticketing', type: 'assigned', read: false, created_at: new Date().toISOString() },
        { id: '2', title: 'Approval Request', message: 'VPN request requires your signature', source_module: 'approval', type: 'approval', read: false, created_at: new Date().toISOString() }
      ]
    },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  })),
  useNotificationPreferences: vi.fn(() => ({
    data: {
      in_app: true,
      email: true,
      slack: false,
      categories: { tickets: true, approvals: true, system: true, announcements: true }
    }
  })),
  useMarkNotificationRead: vi.fn(() => ({ mutate: vi.fn(), mutateAsync: vi.fn() })),
  useMarkAllNotificationsRead: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useUpdateNotificationPreferences: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

describe('Unified Notification Center Page', () => {
  const queryClient = new QueryClient();

  it('renders page header title and alert tabs', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <NotificationCenterPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('Command Notification Center')).toBeInTheDocument();
    expect(screen.getByText('Unread')).toBeInTheDocument();
    expect(screen.getByText('Approvals')).toBeInTheDocument();
  });

  it('filters notifications when typing in query input', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <NotificationCenterPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    const searchInput = screen.getByLabelText('Search notifications');
    expect(searchInput).toBeInTheDocument();
    fireEvent.change(searchInput, { target: { value: 'TKT-104' } });
    expect(searchInput).toHaveValue('TKT-104');
  });
});
