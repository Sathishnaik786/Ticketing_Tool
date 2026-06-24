import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MyQueuePage from '../pages/MyQueuePage';

vi.mock('../hooks/useTicketAssignment', () => ({
  useMyQueue: () => ({
    isLoading: false,
    data: {
      data: [{ id: 't1', ticket_number: 'TKT-1', title: 'Issue', status: 'ASSIGNED', priority: 'HIGH', created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-02T00:00:00.000Z' }],
      meta: { total: 1 },
    },
  }),
  useAssignmentAnalytics: () => ({ data: null }),
}));

function renderPage() {
  const client = new QueryClient();
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <MyQueuePage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('MyQueuePage', () => {
  it('renders page title', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'My Queue' })).toBeInTheDocument();
  });

  it('shows assigned count widget', () => {
    renderPage();
    expect(screen.getByText('Assigned To Me')).toBeInTheDocument();
  });

  it('lists queue tickets', () => {
    renderPage();
    expect(screen.getByText('TKT-1')).toBeInTheDocument();
  });
});
