import * as React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ClipboardList, MessageSquare, AlertCircle, RefreshCw, UserPlus } from 'lucide-react';
import type { TicketTimelineEntry } from '../types/ticketing.types';

interface ActivityLogPanelProps {
  timeline: TicketTimelineEntry[];
  isLoading?: boolean;
}

export function ActivityLogPanel({ timeline, isLoading }: ActivityLogPanelProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 rounded-xl border border-border bg-card p-4 animate-pulse">
        <div className="h-4 w-1/3 bg-muted rounded" />
        <div className="h-10 w-full bg-muted rounded" />
        <div className="h-10 w-full bg-muted rounded" />
      </div>
    );
  }

  if (timeline.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 text-center text-xs text-muted-foreground italic">
        No recent activity logged.
      </div>
    );
  }

  // Sort newest first for log style
  const sorted = [...timeline].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'COMMENT':
        return <MessageSquare className="h-3.5 w-3.5 text-blue-500" />;
      case 'PRIORITY_CHANGE':
      case 'SLA_BREACH':
        return <AlertCircle className="h-3.5 w-3.5 text-red-500" />;
      case 'STATUS_CHANGE':
        return <RefreshCw className="h-3.5 w-3.5 text-green-500" />;
      case 'ASSIGNMENT':
      case 'REASSIGNMENT':
        return <UserPlus className="h-3.5 w-3.5 text-purple-500" />;
      default:
        return <ClipboardList className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  const getActorName = (entry: TicketTimelineEntry) => {
    if (entry.actor?.first_name || entry.actor?.last_name) {
      return `${entry.actor.first_name ?? ''} ${entry.actor.last_name ?? ''}`.trim();
    }
    return entry.actor?.email ?? 'System';
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <h3 className="font-semibold text-sm flex items-center gap-1.5 border-b border-border pb-2">
        <ClipboardList className="h-4 w-4 text-primary" />
        Activity Log
      </h3>
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
        {sorted.map((item) => (
          <div key={item.id} className="flex gap-2 text-xs items-start">
            <div className="mt-0.5 shrink-0 bg-muted/40 p-1 rounded">
              {getLogIcon(item.activity_type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{item.description || item.activity_type}</p>
              <div className="flex justify-between items-center text-[10px] text-muted-foreground mt-0.5">
                <span>By {getActorName(item)}</span>
                <span title={new Date(item.created_at).toLocaleString()}>
                  {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
