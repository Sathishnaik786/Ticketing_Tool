import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TicketListPage from '../pages/TicketListPage';
import React from 'react';

vi.mock('@/config/features', () => ({
  isTicketingEnabled: true,
  isEtmsUiV2Enabled: true,
}));

const mockAuthContext = {
  user: { id: 'user-1', role: 'ADMIN', department_id: 'dept-1', employeeId: 'emp-1' },
  isLoading: false,
  isAuthenticated: true,
  logout: vi.fn(),
  login: vi.fn(),
  hasRole: vi.fn((roles: string | string[]) => true),
  updateProfileImage: vi.fn(),
  refreshProfileImage: vi.fn(),
};

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
}));

const listTicketsMock = vi.fn();

vi.mock('../hooks/useTicketing', () => ({
  useTickets: () => listTicketsMock(),
  ticketingApi: {
    listCategories: vi.fn().mockResolvedValue({ success: true, data: [] }),
  },
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

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/app/tickets?scope=all']}>
        <TicketListPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('TicketListPage - Enterprise UI Features', () => {
  beforeEach(() => {
    listTicketsMock.mockReset();
    vi.clearAllMocks();
  });

  it('renders advanced filter bar search and fields', async () => {
    listTicketsMock.mockReturnValue({
      data: {
        data: [
          {
            id: 't-1',
            ticket_number: 'TKT-1001',
            title: 'IntelliJ license issue',
            status: 'OPEN',
            priority: 'HIGH',
            created_at: '2026-06-01T10:00:00.000Z',
            department: { name: 'IT' },
            assignee: { first_name: 'Jane', last_name: 'Doe' },
            requester: { first_name: 'Bob', last_name: 'Smith' },
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
    expect(screen.getByPlaceholderText('Search tickets by number, subject, or description...')).toBeInTheDocument();
    expect(screen.getByText('TKT-1001')).toBeInTheDocument();
    expect(screen.getByText('IntelliJ license issue')).toBeInTheDocument();
  });

  it('renders quick filter chips correctly', () => {
    listTicketsMock.mockReturnValue({
      data: { data: [], meta: { page: 1, limit: 20, total: 0, pages: 1 } },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    renderPage();
    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Overdue')).toBeInTheDocument();
    expect(screen.getByText('Critical')).toBeInTheDocument();
  });

  it('handles empty state correctly', () => {
    listTicketsMock.mockReturnValue({
      data: { data: [], meta: { page: 1, limit: 20, total: 0, pages: 1 } },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    renderPage();
    expect(screen.getByText('No tickets matching selection')).toBeInTheDocument();
  });
});
