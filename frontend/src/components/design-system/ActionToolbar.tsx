import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface ActionToolbarProps {
  children: ReactNode;
  position?: 'static' | 'sticky' | 'fixed';
  align?: 'start' | 'center' | 'end' | 'between';
  className?: string;
  /** Sticky/fixed offset from bottom on mobile */
  mobileSticky?: boolean;
  label?: string;
}

export function ActionToolbar({
  children,
  position = 'static',
  align = 'end',
  className,
  mobileSticky = false,
  label = 'Actions',
}: ActionToolbarProps) {
  const alignClass = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
  }[align];

  return (
    <div
      role="toolbar"
      aria-label={label}
      className={cn(
        'flex items-center gap-2 flex-wrap',
        alignClass,
        position === 'sticky' && 'sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-2 -mx-1 px-1 border-b border-border',
        position === 'fixed' && 'fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t border-border p-3 safe-area-pb',
        mobileSticky && 'max-md:fixed max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:z-40 max-md:bg-background/95 max-md:backdrop-blur-sm max-md:border-t max-md:border-border max-md:p-3',
        className
      )}
    >
      {children}
    </div>
  );
}
