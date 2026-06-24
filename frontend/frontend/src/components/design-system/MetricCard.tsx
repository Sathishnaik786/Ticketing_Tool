import { type LucideIcon, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export type MetricTone = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

export interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  tone?: MetricTone;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
  href?: string;
  onClick?: () => void;
  className?: string;
  compact?: boolean;
}

const toneStyles: Record<MetricTone, { icon: string; value: string }> = {
  primary: {
    icon: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
    value: 'text-blue-700 dark:text-blue-300',
  },
  success: {
    icon: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
    value: 'text-emerald-700 dark:text-emerald-300',
  },
  warning: {
    icon: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
    value: 'text-amber-700 dark:text-amber-300',
  },
  danger: {
    icon: 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400',
    value: 'text-red-700 dark:text-red-300',
  },
  neutral: {
    icon: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    value: 'text-slate-900 dark:text-white',
  },
};

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
};

export function MetricCard({
  label,
  value,
  icon: Icon,
  tone = 'neutral',
  trend,
  href,
  onClick,
  className,
  compact = false,
}: MetricCardProps) {
  const styles = toneStyles[tone];
  const TrendIcon = trend ? trendIcons[trend.direction] : null;
  const isInteractive = Boolean(href || onClick);

  const content = (
    <>
      {Icon && (
        <div
          className={cn(
            'flex items-center justify-center rounded-xl flex-shrink-0',
            compact ? 'h-9 w-9' : 'h-10 w-10',
            styles.icon
          )}
          aria-hidden
        >
          <Icon className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground truncate">
          {label}
        </p>
        <p
          className={cn(
            'font-bold mt-0.5',
            compact ? 'text-xl' : 'text-2xl',
            styles.value
          )}
        >
          {value}
        </p>
        {trend && TrendIcon && (
          <div className="flex items-center gap-1 mt-1">
            <TrendIcon
              className={cn(
                'h-3 w-3',
                trend.direction === 'up' && 'text-emerald-600',
                trend.direction === 'down' && 'text-red-600',
                trend.direction === 'neutral' && 'text-muted-foreground'
              )}
              aria-hidden
            />
            <span className="text-xs text-muted-foreground">
              {trend.value}
              {trend.label && ` ${trend.label}`}
            </span>
          </div>
        )}
      </div>
    </>
  );

  const baseClass = cn(
    'rounded-xl border border-border bg-card flex items-start gap-3 transition-colors',
    compact ? 'p-3' : 'p-4 min-h-[96px]',
    isInteractive && 'hover:border-primary/40 hover:bg-muted/30 cursor-pointer',
    className
  );

  if (href) {
    return (
      <a href={href} className={baseClass} aria-label={`${label}: ${value}`}>
        {content}
      </a>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(baseClass, 'text-left w-full')}>
        {content}
      </button>
    );
  }

  return <div className={baseClass}>{content}</div>;
}
