import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TeamQueuePage from '../pages/TeamQueuePage';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { role: 'MANAGER', employeeId: 'mgr-1' } }),
}));

vi.mock('../hooks/useTicketAssignment', () => ({
  useTeamQueue: () => ({ isLoading: false, data: { data: [], meta: { total: 3 } } }),
  useUnassignedQueue: () => ({ isLoading: false, data: { data: [], meta: { total: 2 } } }),
  useAssignmentAnalytics: () => ({
    data: { data: { totalAssigned: 5, overloadedAgents: [{ agentId: 'a1', count: 6 }] } },
  }),
}));

describe('TeamQueuePage', () => {
  it('renders team queue metrics', () => {
    const client = new QueryClient();
    render(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <TeamQueuePage />
        </MemoryRouter>
      </QueryClientProvider>
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Team Queue' })).toBeInTheDocument();
    expect(screen.getByText('Unassigned')).toBeInTheDocument();
  });
});
