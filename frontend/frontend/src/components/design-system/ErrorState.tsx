import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  variant?: 'default' | 'inline' | 'compact';
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  retryLabel = 'Try again',
  variant = 'default',
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'rounded-xl border border-destructive/30 bg-destructive/5',
        variant === 'default' && 'p-8 text-center',
        variant === 'compact' && 'p-4',
        variant === 'inline' && 'p-3 flex items-center gap-3',
        className
      )}
    >
      <AlertCircle
        className={cn(
          'text-destructive flex-shrink-0',
          variant === 'inline' ? 'h-4 w-4' : 'h-6 w-6 mx-auto mb-3'
        )}
        aria-hidden
      />
      <div className={variant === 'inline' ? 'flex-1 min-w-0' : undefined}>
        <p className={cn('font-medium text-destructive', variant === 'inline' ? 'text-sm' : 'text-base')}>
          {title}
        </p>
        {message && (
          <p className="text-sm text-muted-foreground mt-1">{message}</p>
        )}
      </div>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className={variant === 'default' ? 'mt-4' : undefined}
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" aria-hidden />
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
