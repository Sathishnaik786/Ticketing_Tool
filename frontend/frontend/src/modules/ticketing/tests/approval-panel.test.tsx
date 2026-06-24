import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TicketApprovalPanel } from '../components/TicketApprovalPanel';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock Tanstack queries
vi.mock('@tanstack/react-query', () => {
  const actual = vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQuery: vi.fn().mockReturnValue({
      data: {
        active: { id: 'mock-app', status: 'PENDING', service_name: 'Access authorization' },
        steps: [{ id: '1', name: 'Manager Approval', status: 'PENDING', approver: 'John Miller' }],
      },
      isLoading: false,
    }),
    useMutation: vi.fn().mockReturnValue({ mutate: vi.fn(), isPending: false }),
    useQueryClient: vi.fn(() => ({
      invalidateQueries: vi.fn(),
    })),
  };
});

describe('TicketApprovalPanel Component', () => {
  function renderComponent() {
    const queryClient = new QueryClient();
    return render(
      <QueryClientProvider client={queryClient}>
        <TicketApprovalPanel ticketId="t-1" />
      </QueryClientProvider>
    );
  }

  it('renders active approvals and steps correctly', () => {
    renderComponent();

    expect(screen.getByText('Approval Workflows')).toBeInTheDocument();
    expect(screen.getByText('Manager Approval')).toBeInTheDocument();
    expect(screen.getByText('Approver: John Miller')).toBeInTheDocument();
    expect(screen.getByText('Approve')).toBeInTheDocument();
    expect(screen.getByText('Reject')).toBeInTheDocument();
  });
});
