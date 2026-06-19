import type { ApprovalWorkflowStep } from '../services/approvalManagementService';

interface ApprovalWorkflowViewProps {
  steps: ApprovalWorkflowStep[];
  currentStepId?: string | null;
}

export function ApprovalWorkflowView({ steps, currentStepId }: ApprovalWorkflowViewProps) {
  if (!steps.length) {
    return <p className="text-sm text-muted-foreground">No workflow steps configured.</p>;
  }

  return (
    <ol className="space-y-3">
      {steps.map((step, index) => {
        const isCurrent = step.id === currentStepId;
        const isPast = currentStepId
          ? steps.findIndex((s) => s.id === currentStepId) > index
          : false;

        return (
          <li
            key={step.id}
            className={`flex items-start gap-3 rounded-md border p-3 ${
              isCurrent ? 'border-primary bg-primary/5' : isPast ? 'opacity-70' : ''
            }`}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold">
              {step.step_order}
            </span>
            <div>
              <p className="text-sm font-medium">{step.step_name}</p>
              <p className="text-xs text-muted-foreground">Approver role: {step.approver_role}</p>
              {isCurrent && <p className="text-xs font-medium text-primary mt-1">Current step</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
