import { Badge } from '@/components/ui/badge';
import type { TicketStatus } from '../types/ticketing.types';

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline' }
> = {
  OPEN: { label: 'Open', variant: 'primary' },
  ASSIGNED: { label: 'Assigned', variant: 'default' },
  IN_PROGRESS: { label: 'In Progress', variant: 'warning' },
  PENDING: { label: 'Pending', variant: 'warning' },
  PENDING_USER: { label: 'Pending User', variant: 'warning' },
  RESOLVED: { label: 'Resolved', variant: 'success' },
  CLOSED: { label: 'Closed', variant: 'secondary' },
  REOPENED: { label: 'Reopened', variant: 'primary' },
  REJECTED: { label: 'Rejected', variant: 'destructive' },
  CANCELLED: { label: 'Cancelled', variant: 'secondary' },
  ESCALATED: { label: 'Escalated', variant: 'destructive' },
};

interface TicketStatusBadgeProps {
  status: TicketStatus | string;
  className?: string;
}

export function TicketStatusBadge({ status, className }: TicketStatusBadgeProps) {
  const normalized = String(status || 'OPEN').toUpperCase();
  const config = STATUS_CONFIG[normalized] ?? { label: normalized.replace(/_/g, ' '), variant: 'outline' as const };

  return (
    <Badge variant={config.variant} className={className} aria-label={`Status: ${config.label}`}>
      {config.label}
    </Badge>
  );
}
