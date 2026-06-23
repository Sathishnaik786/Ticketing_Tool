import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ShieldAlert, Clock, Eye, CheckCircle2, User, RefreshCw, AlertCircle } from 'lucide-react';
import { auditApi } from '@/services/api';

interface AuditLogEntry {
  id: string;
  actor_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_value: any;
  new_value: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
  actor?: {
    first_name: string;
    last_name: string;
    role: string;
  } | null;
}

interface TicketAuditTimelineProps {
  ticketId: string;
}

function formatActorName(actor?: { first_name: string; last_name: string; role: string } | null, email?: string): string {
  if (actor) {
    return `${actor.first_name} ${actor.last_name} (${actor.role})`;
  }
  return email || 'System / Auto-Trigger';
}

function formatActionLabel(action: string): string {
  return action.replace(/_/g, ' ');
}

// Function to render diff details beautifully
function renderValueChanges(oldVal: any, newVal: any) {
  if (!oldVal && !newVal) return <span className="text-muted-foreground">No details recorded</span>;

  // Simple values check
  if (typeof oldVal !== 'object' || typeof newVal !== 'object') {
    return (
      <div className="flex items-center gap-2 mt-1 text-xs">
        <span className="font-mono bg-muted/60 dark:bg-muted/30 px-1.5 py-0.5 rounded text-destructive line-through">
          {String(oldVal ?? 'None')}
        </span>
        <span className="text-muted-foreground">→</span>
        <span className="font-mono bg-success/10 dark:bg-success/5 border border-success/30 px-1.5 py-0.5 rounded text-success">
          {String(newVal ?? 'None')}
        </span>
      </div>
    );
  }

  // Object key matching check
  const keys = Array.from(new Set([...Object.keys(oldVal || {}), ...Object.keys(newVal || {})]));
  const changes: { key: string; old: any; new: any }[] = [];

  for (const key of keys) {
    // Avoid showing huge description diffs if they didn't change
    const o = oldVal?.[key];
    const n = newVal?.[key];
    if (JSON.stringify(o) !== JSON.stringify(n)) {
      changes.push({ key, old: o, new: n });
    }
  }

  if (changes.length === 0) {
    return <span className="text-xs text-muted-foreground">No field changes detected</span>;
  }

  return (
    <ul className="mt-2 space-y-1.5 list-none text-xs border-l border-border/80 pl-3">
      {changes.map((c) => (
        <li key={c.key} className="break-words">
          <span className="font-semibold text-foreground/80">{c.key}</span>:{' '}
          <span className="font-mono bg-destructive/10 dark:bg-destructive/5 border border-destructive/20 px-1 py-0.5 rounded text-destructive/80 line-through">
            {c.old === undefined || c.old === null ? 'None' : typeof c.old === 'object' ? JSON.stringify(c.old) : String(c.old)}
          </span>
          <span className="mx-1 text-muted-foreground">→</span>
          <span className="font-mono bg-success/15 dark:bg-success/5 border border-success/30 px-1 py-0.5 rounded text-success-foreground font-semibold">
            {c.new === undefined || c.new === null ? 'None' : typeof c.new === 'object' ? JSON.stringify(c.new) : String(c.new)}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function TicketAuditTimeline({ ticketId }: TicketAuditTimelineProps) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchAuditLogs() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await auditApi.getLogs({
          entityId: ticketId,
          entityType: 'TICKET',
          limit: 100
        });

        if (active && res.success && res.data) {
          setLogs(res.data.logs || []);
        }
      } catch (err: any) {
        if (active) {
          console.error('Audit logs query error:', err);
          setError(err.message || 'Access Denied: Insufficient permissions to view audit logs.');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    if (ticketId) {
      fetchAuditLogs();
    }

    return () => {
      active = false;
    };
  }, [ticketId]);

  if (isLoading) {
    return (
      <div className="space-y-4 py-4" aria-busy="true" aria-live="polite">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-16 rounded-xl bg-muted/40 animate-pulse border border-border/50" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive flex items-start gap-2.5">
        <ShieldAlert className="h-4.5 w-4.5 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-destructive-foreground">Governance Protection</h4>
          <p className="mt-1 text-xs text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-6 border border-dashed rounded-xl bg-muted/10 border-border/80">
        <Eye className="h-8 w-8 text-muted-foreground/60 mx-auto mb-2" />
        <p className="text-sm font-medium">No Audit Trails Captured</p>
        <p className="text-xs text-muted-foreground mt-0.5">Immutable logging will track updates as they occur.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-primary" />
          Immutable Audit Logs ({logs.length})
        </h4>
        <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary-foreground font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
          Compliance Active
        </span>
      </div>

      <ol className="relative border-l border-border/80 ml-3.5 space-y-6" aria-label="Ticket audit logs timeline">
        {logs.map((log) => {
          return (
            <li key={log.id} className="ml-6">
              <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-background border border-border shadow-sm">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              </span>
              <div className="rounded-xl border border-border bg-card/60 backdrop-blur-sm p-4 shadow-sm transition hover:shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-sm font-bold text-foreground capitalize tracking-wide flex items-center gap-1.5">
                    <RefreshCw className="h-3 w-3 text-muted-foreground" />
                    {formatActionLabel(log.action)}
                  </span>
                  <time className="text-xs text-muted-foreground font-medium" dateTime={log.created_at}>
                    {format(new Date(log.created_at), 'PPp')}
                  </time>
                </div>
                
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3 bg-muted/40 px-2 py-1 rounded w-fit">
                  <User className="h-3.5 w-3.5" />
                  <span>By {formatActorName(log.actor)}</span>
                </div>

                <div className="bg-background/80 border border-border/50 rounded-lg p-3">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">State Modifications</span>
                  {renderValueChanges(log.old_value, log.new_value)}
                </div>

                {(log.ip_address || log.user_agent) && (
                  <div className="mt-3 pt-2.5 border-t border-border/50 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted-foreground font-mono">
                    {log.ip_address && <span>IP: {log.ip_address}</span>}
                    {log.user_agent && (
                      <span className="truncate max-w-[280px]" title={log.user_agent}>
                        UA: {log.user_agent}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
export default TicketAuditTimeline;
