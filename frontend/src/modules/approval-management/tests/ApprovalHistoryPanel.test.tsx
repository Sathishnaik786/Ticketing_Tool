import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ApprovalHistoryPanel } from '../components/ApprovalHistoryPanel';

describe('ApprovalHistoryPanel', () => {
  it('shows loading state', () => {
    render(<ApprovalHistoryPanel history={[]} isLoading />);
    expect(screen.getByText(/Loading approval history/)).toBeInTheDocument();
  });

  it('shows empty state', () => {
    render(<ApprovalHistoryPanel history={[]} />);
    expect(screen.getByText(/No approval activity/)).toBeInTheDocument();
  });

  it('renders history entries', () => {
    render(
      <ApprovalHistoryPanel
        history={[{
          id: 'h1',
          ticket_approval_id: 'a1',
          ticket_id: 't1',
          action: 'APPROVED',
          actor_role: 'MANAGER',
          comments: 'Approved',
          created_at: '2026-06-15T10:00:00.000Z',
        }]}
      />
    );
    expect(screen.getByText('APPROVED')).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });

  it('renders actor role', () => {
    render(
      <ApprovalHistoryPanel
        history={[{
          id: 'h1',
          ticket_approval_id: 'a1',
          ticket_id: 't1',
          action: 'SUBMITTED',
          actor_role: 'EMPLOYEE',
          created_at: '2026-06-15T10:00:00.000Z',
        }]}
      />
    );
    expect(screen.getByText(/Role: EMPLOYEE/)).toBeInTheDocument();
  });
});
