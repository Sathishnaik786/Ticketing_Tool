import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  /** @deprecated Use `actions` instead — kept for backward compatibility */
  children?: ReactNode;
  actions?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  badge?: ReactNode;
  className?: string;
  compact?: boolean;
}

export function PageHeader({
  title,
  description,
  children,
  actions,
  breadcrumbs,
  badge,
  className,
  compact = false,
}: PageHeaderProps) {
  const actionSlot = actions ?? children;

  return (
    <header
      className={cn(
        'flex flex-col gap-3',
        compact ? 'mb-4' : 'mb-6',
        className
      )}
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted-foreground">
          {breadcrumbs.map((crumb, index) => (
            <span key={`${crumb.label}-${index}`} className="flex items-center gap-1">
              {index > 0 && <ChevronRight className="h-3 w-3" aria-hidden />}
              {crumb.href ? (
                <Link
                  to={crumb.href}
                  className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span aria-current="page">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1
              className={cn(
                'font-semibold tracking-tight text-foreground',
                compact ? 'text-xl' : 'text-2xl lg:text-3xl'
              )}
            >
              {title}
            </h1>
            {badge}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground max-w-2xl">{description}</p>
          )}
        </div>
        {actionSlot && (
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">{actionSlot}</div>
        )}
      </div>
    </header>
  );
}
