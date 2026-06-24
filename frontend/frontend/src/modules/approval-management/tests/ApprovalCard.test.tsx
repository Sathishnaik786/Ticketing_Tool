import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ApprovalCard } from '../components/ApprovalCard';

const baseApproval = {
  id: 'a1',
  ticket_id: '550e8400-e29b-41d4-a716-446655440001',
  workflow_id: 'wf1',
  status: 'PENDING' as const,
  started_by: 'e1',
  started_at: '2026-06-15T10:00:00.000Z',
  created_at: '2026-06-15T10:00:00.000Z',
  current_step: {
    id: 's1',
    workflow_id: 'wf1',
    step_order: 1,
    step_name: 'Manager Approval',
    approver_role: 'MANAGER',
    is_required: true,
  },
};

describe('ApprovalCard', () => {
  it('renders status badge', () => {
    render(<ApprovalCard approval={baseApproval} />);
    expect(screen.getByText('PENDING')).toBeInTheDocument();
  });

  it('renders current step when showStep true', () => {
    render(<ApprovalCard approval={baseApproval} />);
    expect(screen.getByText(/Manager Approval/)).toBeInTheDocument();
  });

  it('hides step when showStep false', () => {
    render(<ApprovalCard approval={baseApproval} showStep={false} />);
    expect(screen.queryByText(/Manager Approval/)).not.toBeInTheDocument();
  });

  it('renders started timestamp', () => {
    render(<ApprovalCard approval={baseApproval} />);
    expect(screen.getByText(/Started/)).toBeInTheDocument();
  });
});
