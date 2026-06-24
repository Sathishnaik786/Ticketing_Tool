import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TicketDetailEnterprise } from '../components/TicketDetailEnterprise';
import React from 'react';

// Mock Tanstack queries to avoid API integration requirements in tests
vi.mock('@tanstack/react-query', () => {
  const actual = vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQuery: vi.fn().mockReturnValue({ data: [], isLoading: false }),
    useMutation: vi.fn().mockReturnValue({ mutate: vi.fn(), isPending: false }),
    useQueryClient: vi.fn(() => ({
      invalidateQueries: vi.fn(),
    })),
  };
});

const mockTicket = {
  id: 't-1',
  ticket_number: 'TKT-1001',
  title: 'Database connection issue',
  description: 'Connection timed out when trying to write to production database.',
  status: 'OPEN' as const,
  priority: 'CRITICAL' as const,
  created_at: '2026-06-01T10:00:00.000Z',
  department: { id: 'd-1', name: 'Engineering' },
  assignee: { id: 'emp-1', first_name: 'John', last_name: 'Doe', email: 'john@company.com' },
  requester: { id: 'emp-2', first_name: 'Alice', last_name: 'Smith', email: 'alice@company.com' },
};

describe('TicketDetailEnterprise Component', () => {
  const props = {
    ticket: mockTicket,
    ticketId: 't-1',
    comments: [],
    attachments: [],
    timeline: [],
    assignments: [],
    employees: [],
    commentsLoading: false,
    attachmentsLoading: false,
    timelineLoading: false,
    slaLoading: false,
    assignmentsLoading: false,
    canPostInternal: true,
    canAssign: true,
    canManageSla: true,
    onCreateComment: vi.fn(),
    isCreatingComment: false,
    onUploadAttachment: vi.fn().mockResolvedValue({}),
    isUploading: false,
    onAssign: vi.fn(),
    onReassign: vi.fn(),
    isAssigning: false,
  };

  function renderComponent() {
    const queryClient = new QueryClient();
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <TicketDetailEnterprise {...props} />
        </MemoryRouter>
      </QueryClientProvider>
    );
  }

  it('renders the 3-column ticket detailed layout widgets', () => {
    renderComponent();

    // Check LEFT Column details
    expect(screen.getByText('Ticket Summary')).toBeInTheDocument();
    expect(screen.getByText('Database connection issue')).toBeInTheDocument();
    expect(screen.getByText('Requester')).toBeInTheDocument();
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Details')).toBeInTheDocument();

    // Check CENTER Column details
    expect(screen.getByText('Reply Workspace')).toBeInTheDocument();
    expect(screen.getByText('Reply to Customer')).toBeInTheDocument();
    expect(screen.getByText('Internal Note')).toBeInTheDocument();
    expect(screen.getByText('Ticket Timeline')).toBeInTheDocument();

    // Check RIGHT Column details
    expect(screen.getByText('SLA Overview')).toBeInTheDocument();
    expect(screen.getByText('Approval Workflows')).toBeInTheDocument();
    expect(screen.getByText('Linked Tickets')).toBeInTheDocument();
    expect(screen.getByText('Watchers (0)')).toBeInTheDocument();
    expect(screen.getByText('Activity Log')).toBeInTheDocument();
  });

  it('toggles comment workspace type between Public and Internal Note', () => {
    renderComponent();

    const publicBtn = screen.getByText('Reply to Customer');
    const internalBtn = screen.getByText('Internal Note');

    fireEvent.click(internalBtn);
    expect(screen.getByPlaceholderText('Add an internal note. Only team members will see this.')).toBeInTheDocument();

    fireEvent.click(publicBtn);
    expect(screen.getByPlaceholderText('Write a response. This will be sent directly to the requester.')).toBeInTheDocument();
  });
});
