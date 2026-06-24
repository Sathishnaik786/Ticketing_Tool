import { useState } from 'react';
import {
  PlusCircle,
  UserCheck,
  MessageSquare,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { RecentActivityItem } from '../types/dashboard.types';

interface RecentActivityFeedProps {
  activities?: RecentActivityItem[];
  loading?: boolean;
}

const typeConfig = {
  created: { icon: PlusCircle, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400' },
  assigned: { icon: UserCheck, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400' },
  comment: { icon: MessageSquare, color: 'text-slate-500 bg-slate-50 dark:bg-slate-900/40 dark:text-slate-400' },
  status_change: { icon: RefreshCw, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400' },
  approval_complete: { icon: CheckCircle, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400' },
  sla_breach: { icon: AlertTriangle, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400' },
  info: { icon: Activity, color: 'text-slate-500 bg-slate-50 dark:bg-slate-900/40 dark:text-slate-400' }
};

export function RecentActivityFeed({ activities = [], loading = false }: RecentActivityFeedProps) {
  const [displayCount, setDisplayCount] = useState(4);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 animate-pulse">
        <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-3/4 bg-slate-100 dark:bg-slate-800 rounded" />
                <div className="h-3 w-1/4 bg-slate-100 dark:bg-slate-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const isEmpty = activities.length === 0;
  const visibleActivities = activities.slice(0, displayCount);
  const hasMore = activities.length > displayCount;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between min-h-[320px]">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Live Activity Feed</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Real-time audit updates across system tickets</p>
      </div>

      {isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center" role="status">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Recent activity will appear here.</p>
          <p className="text-xs text-muted-foreground mt-1">No ticket updates have been broadcasted yet.</p>
        </div>
      ) : (
        <div className="flex-1 mt-4 flex flex-col justify-between">
          <div className="relative border-l border-slate-100 dark:border-slate-800 ml-4 pl-6 space-y-4">
            {visibleActivities.map((act) => {
              const config = typeConfig[act.type] || typeConfig.info;
              const Icon = config.icon;
              const initials = act.user?.name
                ? act.user.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
                : 'SYS';

              return (
                <div key={act.id} className="relative group">
                  {/* Timeline icon */}
                  <span
                    className={cn(
                      'absolute -left-[34px] top-1.5 flex items-center justify-center rounded-full h-5 w-5 ring-4 ring-white dark:ring-slate-900',
                      config.color
                    )}
                  >
                    <Icon className="h-3 w-3" aria-hidden />
                  </span>

                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 shrink-0 rounded-full border border-slate-100 dark:border-slate-800">
                      {act.user?.avatarUrl && <AvatarImage src={act.user.avatarUrl} alt={act.user.name} />}
                      <AvatarFallback className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 dark:text-slate-200">
                        <span className="font-semibold text-slate-900 dark:text-white mr-1">
                          {act.user?.name || 'System'}
                        </span>
                        {act.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <time className="text-xs text-muted-foreground" dateTime={act.timestamp}>
                          {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </time>
                        {act.user?.department && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                            {act.user.department}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {hasMore && (
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/50 flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 h-8"
                onClick={() => setDisplayCount((prev) => prev + 4)}
              >
                Load More Updates
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
