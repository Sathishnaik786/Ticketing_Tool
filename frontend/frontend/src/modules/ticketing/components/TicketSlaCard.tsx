import { format } from 'date-fns';
import { AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { TicketSla } from '../types/ticketing.types';

interface TicketSlaCardProps {
  sla?: TicketSla;
  isLoading?: boolean;
  canManageSla?: boolean;
}

function formatDueDate(value?: string | null): string {
  if (!value) return 'Not set';
  return format(new Date(value), 'PPp');
}

export function TicketSlaCard({ sla, isLoading, canManageSla }: TicketSlaCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border/60 p-6 animate-pulse h-48" aria-busy="true" />
    );
  }

  if (!sla) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        SLA information is not available for this ticket.
      </p>
    );
  }

  const breached = sla.breached || sla.response_breached || sla.resolution_breached;

  return (
    <div
      className="rounded-2xl border border-border/60 bg-background/50 p-6 space-y-4"
      aria-label="SLA details"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
          Service Level Agreement
        </h3>
        {breached ? (
          <Badge variant="destructive" aria-label="SLA breached">
            <AlertTriangle className="h-3 w-3 mr-1" aria-hidden="true" />
            SLA Breached
          </Badge>
        ) : (
          <Badge variant="success" aria-label="SLA on track">
            <CheckCircle2 className="h-3 w-3 mr-1" aria-hidden="true" />
            On Track
          </Badge>
        )}
      </div>

      <dl className="grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" aria-hidden="true" />
            Response Due
          </dt>
          <dd className="text-sm font-medium mt-1">{formatDueDate(sla.response_due_at)}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" aria-hidden="true" />
            Resolution Due
          </dt>
          <dd className="text-sm font-medium mt-1">{formatDueDate(sla.resolution_due_at)}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs uppercase tracking-wider text-muted-foreground">Current Status</dt>
          <dd className="text-sm font-medium mt-1">{sla.status ?? (breached ? 'Breached' : 'Active')}</dd>
        </div>
      </dl>

      {canManageSla && (
        <p className="text-xs text-muted-foreground" id="sla-admin-note">
          SLA policy changes are managed by HR and administrators via backend controls.
        </p>
      )}
    </div>
  );
}
