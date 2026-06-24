import { Badge } from '@/components/ui/badge';
import type { TicketPriority } from '../types/ticketing.types';

const PRIORITY_CONFIG: Record<
  TicketPriority,
  { label: string; variant: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline' }
> = {
  LOW: { label: 'Low', variant: 'secondary' },
  MEDIUM: { label: 'Medium', variant: 'default' },
  HIGH: { label: 'High', variant: 'warning' },
  CRITICAL: { label: 'Critical', variant: 'destructive' },
};

interface TicketPriorityBadgeProps {
  priority: TicketPriority | string;
  className?: string;
}

export function TicketPriorityBadge({ priority, className }: TicketPriorityBadgeProps) {
  const normalized = String(priority || 'MEDIUM').toUpperCase() as TicketPriority;
  const config = PRIORITY_CONFIG[normalized] ?? { label: normalized, variant: 'outline' as const };

  return (
    <Badge variant={config.variant} className={className} aria-label={`Priority: ${config.label}`}>
      {config.label}
    </Badge>
  );
}
