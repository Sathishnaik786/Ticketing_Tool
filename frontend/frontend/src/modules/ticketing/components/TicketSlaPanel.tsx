import * as React from 'react';
import { format } from 'date-fns';
import { Shield, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { TicketSla } from '../types/ticketing.types';


interface TicketSlaPanelProps {
  sla?: TicketSla | null;
  isLoading?: boolean;
}

export function TicketSlaPanel({ sla, isLoading }: TicketSlaPanelProps) {
  const [now, setNow] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4 rounded-xl border border-border bg-card p-4 animate-pulse">
        <div className="h-4 w-1/3 bg-muted rounded" />
        <div className="h-6 w-full bg-muted rounded" />
        <div className="h-4 w-full bg-muted rounded" />
      </div>
    );
  }

  if (!sla) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 text-center text-sm text-muted-foreground">
        No SLA configuration active for this ticket.
      </div>
    );
  }

  const formatCountdown = (dueAtStr?: string | null) => {
    if (!dueAtStr) return 'No target';
    const dueAt = new Date(dueAtStr);
    const diff = dueAt.getTime() - now.getTime();

    if (diff <= 0) return 'Breached';

    const secs = Math.floor(diff / 1000);
    const mins = Math.floor(secs / 60);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${mins % 60}m`;
    return `${mins}m ${secs % 60}s`;
  };

  const getSlaProgressInfo = (dueAtStr?: string | null, breached?: boolean) => {
    if (!dueAtStr) return { percent: 100, color: 'bg-muted', isWarning: false, isBreached: false };
    if (breached) return { percent: 100, color: 'bg-destructive', isWarning: false, isBreached: true };

    const dueAt = new Date(dueAtStr).getTime();
    const diff = dueAt - now.getTime();
    if (diff <= 0) return { percent: 100, color: 'bg-destructive', isWarning: false, isBreached: true };

    // Standard 8 hours resolution SLA calculation representation:
    // If we have less than 2 hours left, flag warning threshold.
    const isWarning = diff < 2 * 60 * 60 * 1000;
    const totalDuration = 8 * 60 * 60 * 1000; // 8 hours SLA
    const elapsed = Math.max(0, totalDuration - diff);
    const percent = Math.min(100, (elapsed / totalDuration) * 100);

    const color = isWarning ? 'bg-amber-500' : 'bg-primary';

    return { percent, color, isWarning, isBreached: false };
  };

  const responseSla = getSlaProgressInfo(sla.response_due_at, sla.response_breached);
  const resolutionSla = getSlaProgressInfo(sla.resolution_due_at, sla.resolution_breached);

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-border">
        <h3 className="font-semibold text-sm flex items-center gap-1.5">
          <Shield className="h-4 w-4 text-primary" />
          SLA Overview
        </h3>
        {(sla.breached || sla.response_breached || sla.resolution_breached) ? (
          <Badge variant="destructive" className="text-xs">Breached</Badge>
        ) : (
          <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200">Active</Badge>
        )}
      </div>

      {/* Response SLA */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-medium">
          <span>First Response target</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatCountdown(sla.response_due_at)}
          </span>
        </div>
        <Progress value={responseSla.percent} className="h-2" indicatorClassName={responseSla.color} />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{sla.response_due_at ? format(new Date(sla.response_due_at), 'p (PP)') : 'No Target'}</span>
          {responseSla.isWarning && <span className="text-amber-500 flex items-center gap-0.5"><AlertTriangle className="h-3 w-3" /> Near Breach</span>}
        </div>
      </div>

      {/* Resolution SLA */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-medium">
          <span>Resolution target</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatCountdown(sla.resolution_due_at)}
          </span>
        </div>
        <Progress value={resolutionSla.percent} className="h-2" indicatorClassName={resolutionSla.color} />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{sla.resolution_due_at ? format(new Date(sla.resolution_due_at), 'p (PP)') : 'No Target'}</span>
          {resolutionSla.isWarning && <span className="text-amber-500 flex items-center gap-0.5"><AlertTriangle className="h-3 w-3" /> Near Breach</span>}
        </div>
      </div>
    </div>
  );
}
