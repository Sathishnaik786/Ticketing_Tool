import { type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'compact' | 'inline';
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
  secondaryAction,
  variant = 'default',
  className,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        'flex flex-col items-center justify-center text-center',
        variant === 'default' && 'py-16 px-6',
        variant === 'compact' && 'py-10 px-4',
        variant === 'inline' && 'py-6 px-4',
        className
      )}
    >
      {Icon && (
        <div
          className={cn(
            'rounded-xl bg-muted flex items-center justify-center mb-4',
            variant === 'inline' ? 'h-10 w-10' : 'h-14 w-14'
          )}
          aria-hidden
        >
          <Icon className={variant === 'inline' ? 'h-5 w-5 text-muted-foreground' : 'h-7 w-7 text-muted-foreground'} />
        </div>
      )}
      <h3 className={cn('font-semibold text-foreground', variant === 'inline' ? 'text-sm' : 'text-base')}>
        {title}
      </h3>
      {description && (
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>
      )}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-2 mt-4">
          {action && (
            <Button size="sm" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button size="sm" variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
