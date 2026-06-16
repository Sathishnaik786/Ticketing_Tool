import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { DataTableSkeleton } from '@/components/common/Skeletons';
import { useTicketCommunications } from '../hooks/useCommunicationTracking';
import type { TicketCommunication } from '../services/communicationTrackingService';

function formatAuthor(comm: TicketCommunication) {
  const author = comm.author;
  if (!author) return 'Unknown';
  const name = `${author.first_name ?? ''} ${author.last_name ?? ''}`.trim();
  return name || author.email || 'Unknown';
}

interface CommunicationPanelProps {
  ticketId: string;
}

export function CommunicationPanel({ ticketId }: CommunicationPanelProps) {
  const { data, isLoading, isError, error } = useTicketCommunications(ticketId);

  if (isLoading) return <DataTableSkeleton />;

  if (isError) {
    return (
      <p className="text-sm text-destructive" role="alert">
        {(error as Error)?.message ?? 'Unable to load communications.'}
      </p>
    );
  }

  const communications = data?.data.communications ?? [];
  const callLogs = data?.data.call_logs ?? [];
  const emailLogs = data?.data.email_logs ?? [];

  if (!communications.length && !callLogs.length && !emailLogs.length) {
    return <p className="text-sm text-muted-foreground">No communications recorded yet.</p>;
  }

  return (
    <div className="space-y-6">
      <section aria-label="Communication history">
        <h3 className="text-sm font-semibold mb-3">All Communications</h3>
        <ul className="space-y-3">
          {communications.map((comm) => (
            <li key={comm.id} className="rounded-lg border p-4 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{comm.communication_type}</Badge>
                <Badge variant="secondary">{comm.direction}</Badge>
                {comm.visibility === 'INTERNAL' && <Badge>Internal</Badge>}
              </div>
              {comm.subject && <p className="text-sm font-medium">{comm.subject}</p>}
              <p className="text-sm whitespace-pre-wrap">{comm.message}</p>
              <p className="text-xs text-muted-foreground">
                {formatAuthor(comm)} · {format(new Date(comm.created_at), 'PPp')}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {callLogs.length > 0 && (
        <section aria-label="Call logs">
          <h3 className="text-sm font-semibold mb-3">Call Logs</h3>
          <ul className="space-y-2">
            {callLogs.map((log) => (
              <li key={log.id} className="rounded-lg border p-3 text-sm">
                <span className="font-medium">{log.outcome}</span>
                {log.customer_name && ` · ${log.customer_name}`}
                {log.phone_number && ` · ${log.phone_number}`}
                {log.duration_seconds != null && ` · ${log.duration_seconds}s`}
              </li>
            ))}
          </ul>
        </section>
      )}

      {emailLogs.length > 0 && (
        <section aria-label="Email logs">
          <h3 className="text-sm font-semibold mb-3">Email Logs</h3>
          <ul className="space-y-2">
            {emailLogs.map((log) => (
              <li key={log.id} className="rounded-lg border p-3 text-sm">
                <span className="font-medium">{log.subject}</span> ({log.status})
                <p className="text-xs text-muted-foreground mt-1">
                  {log.sender} → {log.recipient}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
