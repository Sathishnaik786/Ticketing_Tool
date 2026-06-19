import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import type { TicketApproval } from '../services/approvalManagementService';

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PENDING: 'secondary',
  APPROVED: 'default',
  REJECTED: 'destructive',
  CANCELLED: 'outline',
  ESCALATED: 'secondary',
};

interface ApprovalCardProps {
  approval: TicketApproval;
  showStep?: boolean;
}

export function ApprovalCard({ approval, showStep = true }: ApprovalCardProps) {
  return (
    <article className="rounded-lg border bg-card p-4 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">Ticket {approval.ticket_id.slice(0, 8)}…</p>
        <Badge variant={statusVariant[approval.status] ?? 'outline'}>{approval.status}</Badge>
      </div>
      {showStep && approval.current_step && (
        <p className="text-sm text-muted-foreground">
          Current step: {approval.current_step.step_name} ({approval.current_step.approver_role})
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        Started {format(new Date(approval.created_at), 'PPp')}
      </p>
    </article>
  );
}
