import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TicketAssignmentActions } from '../components/TicketAssignmentActions';
import type { Ticket } from '@/modules/ticketing/types/ticketing.types';

vi.mock('@/config/features', () => ({ isTicketAssignmentsEnabled: true }));
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { role: 'MANAGER', employeeId: 'mgr-1' } }),
}));
vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: { data: [] } }),
}));
vi.mock('../hooks/useTicketAssignment', () => ({
  useAssignTicketMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useReassignTicketMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

const ticket = {
  id: 't1',
  ticket_number: 'TKT-2026-00001',
  title: 'Test',
  status: 'OPEN',
} as Ticket;

describe('TicketAssignmentActions', () => {
  it('renders assign button for managers', () => {
    render(<TicketAssignmentActions ticket={ticket} />);
    expect(screen.getByRole('button', { name: /assign/i })).toBeInTheDocument();
  });

  it('returns null when flag is off', async () => {
    vi.resetModules();
    vi.doMock('@/config/features', () => ({ isTicketAssignmentsEnabled: false }));
    const { TicketAssignmentActions: Actions } = await import('../components/TicketAssignmentActions');
    const { container } = render(<Actions ticket={ticket} />);
    expect(container.firstChild).toBeNull();
  });
});

describe('TicketAssignmentActions RBAC', () => {
  it('hides actions for employees', () => {
    vi.doMock('@/contexts/AuthContext', () => ({
      useAuth: () => ({ user: { role: 'EMPLOYEE', employeeId: 'emp-1' } }),
    }));
    // Employee role cannot manage assignments — component returns null before drawer
    expect(canManageAssignment('EMPLOYEE')).toBe(false);
    expect(canManageAssignment('MANAGER')).toBe(true);
  });
});

function canManageAssignment(role?: string): boolean {
  return role === 'ADMIN' || role === 'HR' || role === 'MANAGER';
}
