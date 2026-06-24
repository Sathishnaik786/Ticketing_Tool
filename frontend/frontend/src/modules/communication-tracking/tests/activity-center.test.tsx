import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ActivityCenterPage } from '../pages/ActivityCenterPage';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({ user: { id: 'u-1', firstName: 'John', role: 'ADMIN' } })),
}));

vi.mock('@/modules/ticketing/hooks/useTicketing', () => ({
  useTickets: vi.fn(() => ({ data: { data: [] } })),
}));

vi.mock('@/modules/approval-management/hooks/useApprovalManagement', () => ({
  usePendingApprovals: vi.fn(() => []),
}));

vi.mock('@/modules/dashboard/hooks/useEtmsDashboard', () => ({
  useEtmsDashboard: vi.fn(() => ({
    kpis: null,
    ticketStatus: null,
    departmentPerformance: [],
    activities: [
      { id: 'act-1', title: 'Ticket TKT-1025 Assigned', description: 'Assigned to Support Tech', created_at: new Date().toISOString() }
    ],
    pendingApprovals: [],
    knowledgeStats: null,
    loading: false
  })),
}));

describe('Operations Activity Center Page', () => {
  const queryClient = new QueryClient();

  it('renders page header title and dashboard panels', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ActivityCenterPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('Operations Activity Center')).toBeInTheDocument();
    expect(screen.getByText('Active Tickets Operations (0)')).toBeInTheDocument();
    expect(screen.getByText('Ticket TKT-1025 Assigned')).toBeInTheDocument();
  });
});
