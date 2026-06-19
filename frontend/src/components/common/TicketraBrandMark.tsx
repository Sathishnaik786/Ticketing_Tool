import { cn } from '@/lib/utils';

const sizeClasses = {
  sm: 'w-8 h-8 text-[8px] rounded-lg',
  md: 'w-10 h-10 text-[9px] rounded-xl',
  lg: 'w-11 h-11 text-[10px] rounded-xl',
  xl: 'h-10 lg:h-12 w-auto px-3 text-[11px] rounded-xl',
} as const;

interface TicketraBrandMarkProps {
  size?: keyof typeof sizeClasses;
  className?: string;
  inverted?: boolean;
}

/** Ticketra ETMS brand mark — shell branding only. */
export function TicketraBrandMark({ size = 'md', className, inverted = false }: TicketraBrandMarkProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center font-display font-black tracking-tighter leading-none shrink-0',
        inverted
          ? 'bg-white/15 text-white border border-white/25 backdrop-blur-sm'
          : 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-sm',
        sizeClasses[size],
        className
      )}
      aria-hidden="true"
    >
      TK
    </div>
  );
}

export function TicketraWordmark({ className }: { className?: string }) {
  return (
    <span className={cn('font-display font-semibold tracking-tight text-slate-900 dark:text-white', className)}>
      Ticket<span className="text-blue-600 dark:text-blue-400">ra</span>
    </span>
  );
}

