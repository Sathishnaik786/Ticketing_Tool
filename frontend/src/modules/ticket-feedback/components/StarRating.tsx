import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  label?: string;
  id?: string;
}

export function StarRating({ value, onChange, disabled = false, label, id }: StarRatingProps) {
  const interactive = Boolean(onChange) && !disabled;

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <div
        id={id}
        role={interactive ? 'radiogroup' : undefined}
        aria-label={label || 'Rating'}
        className="flex items-center gap-1"
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => onChange?.(star)}
            className={cn(
              'p-1 rounded-md transition-colors',
              interactive && 'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50',
              !interactive && 'cursor-default'
            )}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            aria-pressed={value >= star}
          >
            <Star
              className={cn(
                'h-6 w-6',
                value >= star ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
