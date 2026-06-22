import { format } from 'date-fns';
import { type LucideIcon, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ActivityTimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  actor?: string;
  icon?: LucideIcon;
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export interface ActivityTimelineProps {
  items: ActivityTimelineItem[];
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
  compact?: boolean;
}

const toneDot: Record<NonNullable<ActivityTimelineItem['tone']>, string> = {
  default: 'bg-primary',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
};

export function ActivityTimeline({
  items,
  isLoading,
  emptyMessage = 'No activity yet.',
  className,
  compact = false,
}: ActivityTimelineProps) {
  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)} aria-live="polite" aria-busy="true">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p className={cn('text-sm text-muted-foreground', className)} role="status">
        {emptyMessage}
      </p>
    );
  }

  const sorted = [...items].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <ol
      className={cn('relative border-l border-border space-y-0', compact ? 'ml-2' : 'ml-3', className)}
      aria-label="Activity timeline"
    >
      {sorted.map((item, index) => {
        const Icon = item.icon ?? Circle;
        const isLast = index === sorted.length - 1;

        return (
          <li key={item.id} className={cn('relative', compact ? 'ml-4 pb-4' : 'ml-6 pb-6', isLast && 'pb-0')}>
            <span
              className={cn(
                'absolute -left-[9px] flex items-center justify-center rounded-full bg-background border border-border',
                compact ? 'h-4 w-4' : 'h-6 w-6'
              )}
            >
              <Icon
                className={cn(
                  compact ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5',
                  'text-primary'
                )}
                aria-hidden
              />
              {item.tone && (
                <span
                  className={cn('absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full', toneDot[item.tone])}
                  aria-hidden
                />
              )}
            </span>
            <div className={cn('rounded-lg border border-border/60 bg-card', compact ? 'p-2.5' : 'p-3')}>
              <div className="flex flex-wrap items-center justify-between gap-1">
                <span className={cn('font-medium', compact ? 'text-xs' : 'text-sm')}>{item.title}</span>
                <time className="text-xs text-muted-foreground" dateTime={item.timestamp}>
                  {format(new Date(item.timestamp), compact ? 'MMM d' : 'PPp')}
                </time>
              </div>
              {item.actor && (
                <p className="text-xs text-muted-foreground mt-0.5">By {item.actor}</p>
              )}
              {item.description && (
                <p className={cn('text-muted-foreground mt-1 whitespace-pre-wrap break-words', compact ? 'text-xs' : 'text-sm')}>
                  {item.description}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
