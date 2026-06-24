import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface LoadingStateProps {
  label?: string;
  variant?: 'spinner' | 'skeleton' | 'inline';
  rows?: number;
  className?: string;
}

export function LoadingState({
  label = 'Loading...',
  variant = 'spinner',
  rows = 5,
  className,
}: LoadingStateProps) {
  if (variant === 'inline') {
    return (
      <span
        className={cn('inline-flex items-center gap-2 text-sm text-muted-foreground', className)}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        {label}
      </span>
    );
  }

  if (variant === 'skeleton') {
    return (
      <div
        className={cn('space-y-3', className)}
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label={label}
      >
        <span className="sr-only">{label}</span>
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn('flex flex-col items-center justify-center py-16 gap-3', className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
