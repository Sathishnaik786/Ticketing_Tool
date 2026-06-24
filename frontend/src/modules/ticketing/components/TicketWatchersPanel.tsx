import * as React from 'react';
import { Eye, EyeOff, Bell, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ticketingApi } from '../services/ticketingService';
import type { TicketWatcher } from '../types/ticketing.types';

interface TicketWatchersPanelProps {
  ticketId: string;
  currentUserEmployeeId?: string;
}

export function TicketWatchersPanel({ ticketId, currentUserEmployeeId }: TicketWatchersPanelProps) {
  const qc = useQueryClient();

  const { data: watchers = [], isLoading } = useQuery({
    queryKey: ['ticket-watchers', ticketId],
    queryFn: async () => (await ticketingApi.listWatchers(ticketId)).data,
    enabled: Boolean(ticketId),
  });

  const addWatcherMutation = useMutation({
    mutationFn: (empId: string) => ticketingApi.addWatcher(ticketId, empId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ticket-watchers', ticketId] });
      toast.success('You are now watching this ticket');
    },
  });

  const removeWatcherMutation = useMutation({
    mutationFn: (empId: string) => ticketingApi.removeWatcher(ticketId, empId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ticket-watchers', ticketId] });
      toast.success('You stopped watching this ticket');
    },
  });

  const isWatching = watchers.some((w) => w.employee_id === currentUserEmployeeId);

  const handleToggleWatch = () => {
    if (!currentUserEmployeeId) {
      toast.error('User information unavailable');
      return;
    }
    if (isWatching) {
      removeWatcherMutation.mutate(currentUserEmployeeId);
    } else {
      addWatcherMutation.mutate(currentUserEmployeeId);
    }
  };

  const getInitials = (name = '') => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-border">
        <h3 className="font-semibold text-sm flex items-center gap-1.5">
          <Eye className="h-4 w-4 text-primary" />
          Watchers ({watchers.length})
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleToggleWatch}
          className="h-8 text-xs gap-1.5"
          disabled={addWatcherMutation.isPending || removeWatcherMutation.isPending}
        >
          {isWatching ? (
            <>
              <EyeOff className="h-3.5 w-3.5" />
              Unwatch
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5" />
              Watch
            </>
          )}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex gap-2 animate-pulse">
          <div className="h-8 w-8 rounded-full bg-muted" />
          <div className="h-8 w-8 rounded-full bg-muted" />
        </div>
      ) : watchers.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">No watchers. Click Watch to receive updates.</p>
      ) : (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {watchers.map((watcher) => {
              const emp = watcher.employee;
              const name = emp ? `${emp.first_name ?? ''} ${emp.last_name ?? ''}`.trim() : 'System User';
              const initials = getInitials(name);
              return (
                <div
                  key={watcher.id}
                  className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-lg border border-border/50 text-xs w-full max-w-[200px]"
                  title={`${name} is watching this ticket`}
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[10px]">
                    {initials || '?'}
                  </div>
                  <div className="truncate flex-1">
                    <p className="font-medium text-foreground truncate">{name}</p>
                  </div>
                  <Bell className="h-3 w-3 text-primary shrink-0 opacity-80" />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
