import { format } from 'date-fns';
import {
  MessageSquare,
  UserPlus,
  RefreshCw,
  CircleDot,
  CheckCircle2,
  RotateCcw,
  Paperclip,
} from 'lucide-react';
import type { TicketTimelineEntry } from '../types/ticketing.types';

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  CREATED: CircleDot,
  STATUS_CHANGE: RefreshCw,
  ASSIGNMENT: UserPlus,
  REASSIGNMENT: UserPlus,
  COMMENT: MessageSquare,
  ATTACHMENT: Paperclip,
  CLOSURE: CheckCircle2,
  REOPEN: RotateCcw,
  RESOLUTION: CheckCircle2,
};

function formatActivityLabel(type: string): string {
  const labels: Record<string, string> = {
    CREATED: 'Created',
    STATUS_CHANGE: 'Status Changed',
    ASSIGNMENT: 'Assigned',
    REASSIGNMENT: 'Reassigned',
    COMMENT: 'Commented',
    ATTACHMENT: 'Attachment Added',
    CLOSURE: 'Closed',
    REOPEN: 'Reopened',
    RESOLUTION: 'Resolved',
    PRIORITY_CHANGE: 'Priority Changed',
    SLA_BREACH: 'SLA Breached',
  };
  return labels[type] ?? type.replace(/_/g, ' ');
}

function formatActor(entry: TicketTimelineEntry): string {
  if (entry.actor?.first_name || entry.actor?.last_name) {
    return `${entry.actor.first_name ?? ''} ${entry.actor.last_name ?? ''}`.trim();
  }
  return entry.actor?.email ?? 'System';
}

interface TicketTimelineProps {
  entries: TicketTimelineEntry[];
  isLoading?: boolean;
}

export function TicketTimeline({ entries, isLoading }: TicketTimelineProps) {
  if (isLoading) {
    return (
      <div className="space-y-4" aria-live="polite" aria-busy="true">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-16 rounded-xl bg-muted/30 animate-pulse" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        No timeline events recorded yet.
      </p>
    );
  }

  const sorted = [...entries].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return (
    <ol className="relative border-l border-border/60 ml-3 space-y-6" aria-label="Ticket timeline">
      {sorted.map((entry) => {
        const Icon = ACTIVITY_ICONS[entry.activity_type] ?? CircleDot;
        return (
          <li key={entry.id} className="ml-6">
            <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-background border border-border">
              <Icon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            </span>
            <div className="rounded-xl border border-border/50 bg-background/40 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <span className="text-sm font-semibold">
                  {formatActivityLabel(entry.activity_type)}
                </span>
                <time className="text-xs text-muted-foreground" dateTime={entry.created_at}>
                  {format(new Date(entry.created_at), 'PPp')}
                </time>
              </div>
              <p className="text-xs text-muted-foreground mb-1">By {formatActor(entry)}</p>
              {entry.description && (
                <p className="text-sm whitespace-pre-wrap break-words">{entry.description}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
