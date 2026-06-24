import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AssignmentAnalyticsPage from '../pages/AssignmentAnalyticsPage';

vi.mock('../hooks/useTicketAssignment', () => ({
  useAssignmentAnalytics: () => ({
    isLoading: false,
    data: {
      data: {
        assignmentCount: 10,
        averageQueueSize: 2.5,
        totalAssigned: 8,
        totalUnassigned: 2,
        ticketsPerAgent: [{ agentId: 'a1', count: 3 }],
        departmentWorkload: [{ departmentId: 'd1', count: 5 }],
        assignmentTrend: [{ month: '2026-01', count: 4 }],
      },
    },
  }),
}));

describe('AssignmentAnalyticsPage', () => {
  it('renders analytics metrics', () => {
    const client = new QueryClient();
    render(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <AssignmentAnalyticsPage />
        </MemoryRouter>
      </QueryClientProvider>
    );
    expect(screen.getByText('Assignment Analytics')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Assignment Trends')).toBeInTheDocument();
  });

  it('renders tickets per agent section', () => {
    const client = new QueryClient();
    render(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <AssignmentAnalyticsPage />
        </MemoryRouter>
      </QueryClientProvider>
    );
    expect(screen.getByText('Tickets Per Agent')).toBeInTheDocument();
  });
});
