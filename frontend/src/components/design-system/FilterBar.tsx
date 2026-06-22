import { type ReactNode } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface FilterBarProps {
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  children?: ReactNode;
  actions?: ReactNode;
  onClear?: () => void;
  showClear?: boolean;
  className?: string;
  compact?: boolean;
}

export function FilterBar({
  search,
  children,
  actions,
  onClear,
  showClear = false,
  className,
  compact = false,
}: FilterBarProps) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-border bg-card',
        compact ? 'p-3' : 'p-4',
        className
      )}
      role="search"
      aria-label="Filters"
    >
      {search && (
        <div className="relative flex-1 min-w-[180px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden />
          <Input
            type="search"
            value={search.value}
            onChange={(e) => search.onChange(e.target.value)}
            placeholder={search.placeholder ?? 'Search...'}
            className="pl-9 h-9"
            aria-label={search.placeholder ?? 'Search'}
          />
        </div>
      )}

      {children && (
        <div className="flex flex-wrap items-center gap-2 flex-1">{children}</div>
      )}

      <div className="flex items-center gap-2 sm:ml-auto">
        {showClear && onClear && (
          <Button variant="ghost" size="sm" onClick={onClear} aria-label="Clear filters">
            <X className="h-4 w-4 mr-1" aria-hidden />
            Clear
          </Button>
        )}
        {actions}
      </div>
    </div>
  );
}
