import { format } from 'date-fns';
import type { ApprovalHistoryEntry } from '../services/approvalManagementService';

interface ApprovalHistoryPanelProps {
  history: ApprovalHistoryEntry[];
  isLoading?: boolean;
}

export function ApprovalHistoryPanel({ history, isLoading }: ApprovalHistoryPanelProps) {
  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading approval history…</p>;
  }

  if (!history.length) {
    return <p className="text-sm text-muted-foreground">No approval activity recorded yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {history.map((entry) => (
        <li key={entry.id} className="rounded-md border p-3 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-medium">{entry.action}</span>
            <span className="text-xs text-muted-foreground">
              {format(new Date(entry.created_at), 'PPp')}
            </span>
          </div>
          {entry.actor_role && (
            <p className="text-xs text-muted-foreground mt-1">Role: {entry.actor_role}</p>
          )}
          {entry.comments && <p className="mt-2 whitespace-pre-wrap">{entry.comments}</p>}
        </li>
      ))}
    </ul>
  );
}
