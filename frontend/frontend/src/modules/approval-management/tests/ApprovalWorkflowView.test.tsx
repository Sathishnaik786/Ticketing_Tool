import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ApprovalWorkflowView } from '../components/ApprovalWorkflowView';

const steps = [
  { id: 's1', workflow_id: 'wf1', step_order: 1, step_name: 'Manager', approver_role: 'MANAGER', is_required: true },
  { id: 's2', workflow_id: 'wf1', step_order: 2, step_name: 'Finance', approver_role: 'FINANCE', is_required: true },
];

describe('ApprovalWorkflowView', () => {
  it('renders empty message when no steps', () => {
    render(<ApprovalWorkflowView steps={[]} />);
    expect(screen.getByText(/No workflow steps/)).toBeInTheDocument();
  });

  it('renders all steps', () => {
    render(<ApprovalWorkflowView steps={steps} currentStepId="s1" />);
    expect(screen.getByText('Manager')).toBeInTheDocument();
    expect(screen.getByText('Finance')).toBeInTheDocument();
  });

  it('highlights current step', () => {
    render(<ApprovalWorkflowView steps={steps} currentStepId="s1" />);
    expect(screen.getByText('Current step')).toBeInTheDocument();
  });

  it('shows approver role for each step', () => {
    render(<ApprovalWorkflowView steps={steps} />);
    expect(screen.getByText(/Approver role: MANAGER/)).toBeInTheDocument();
    expect(screen.getByText(/Approver role: FINANCE/)).toBeInTheDocument();
  });
});
