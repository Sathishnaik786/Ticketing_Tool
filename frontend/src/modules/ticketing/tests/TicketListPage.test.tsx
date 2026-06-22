import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TicketListPage from '../pages/TicketListPage';

vi.mock('@/config/features', () => ({
  isTicketingEnabled: true,
  isEtmsUiV2Enabled: false,
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'user-1', role: 'MANAGER', department_id: 'dept-1' },
    isLoading: false,
  })),
}));

const listTicketsMock = vi.fn();

vi.mock('../hooks/useTicketing', () => ({
  useTickets: () => listTicketsMock(),
}));

vi.mock('@/services/api', () => ({
  departmentsApi: {
    getAll: vi.fn().mockResolvedValue([{ id: 'dept-1', name: 'Engineering' }]),
  },
  employeesApi: {
    getAll: vi.fn().mockResolvedValue({
      data: [{ id: 'emp-1', firstName: 'Jane', lastName: 'Doe' }],
      meta: { page: 1, limit: 200, total: 1, totalPages: 1 },
    }),
  },
}));

beforeAll(() => {
  const mockIntersectionObserver = vi.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.IntersectionObserver = mockIntersectionObserver as typeof IntersectionObserver;
});

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/app/tickets?scope=mine']}>
        <TicketListPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('TicketListPage', () => {
  beforeEach(() => {
    listTicketsMock.mockReset();
  });

  it('renders loading skeleton while tickets load', () => {
    listTicketsMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    renderPage();
    expect(screen.getByRole('heading', { name: 'My Tickets' })).toBeInTheDocument();
  });

  it('renders ticket rows when data is available', async () => {
    listTicketsMock.mockReturnValue({
      data: {
        data: [
          {
            id: 'ticket-1',
            ticket_number: 'TKT-2026-00001',
            title: 'VPN issue',
            status: 'OPEN',
            priority: 'HIGH',
            created_at: '2026-06-01T10:00:00.000Z',
            department: { name: 'IT' },
            assignee: { first_name: 'Alex', last_name: 'Smith' },
            requester: { first_name: 'Sam', last_name: 'Lee' },
          },
        ],
        meta: { page: 1, limit: 20, total: 1, pages: 1 },
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('TKT-2026-00001')).toBeInTheDocument();
      expect(screen.getByText('VPN issue')).toBeInTheDocument();
    });
  });
});
