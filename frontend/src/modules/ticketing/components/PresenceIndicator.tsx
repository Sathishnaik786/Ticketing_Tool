import * as React from 'react';
import { cn } from '@/lib/utils';

export interface PresenceIndicatorProps {
  userId?: string;
  isOnline?: boolean;
  className?: string;
}

export function PresenceIndicator({ userId, isOnline = false, className }: PresenceIndicatorProps) {
  // Simple online status heuristic (for demo, make specific mock IDs online)
  const isUserOnline = React.useMemo(() => {
    if (isOnline) return true;
    if (!userId) return false;
    
    // Make admin/managers mock online, employees alternating
    const numericId = userId.charCodeAt(0) + (userId.charCodeAt(1) || 0);
    return numericId % 2 === 0;
  }, [userId, isOnline]);

  return (
    <span
      className={cn(
        "relative flex h-2.5 w-2.5 rounded-full shrink-0",
        isUserOnline ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700",
        className
      )}
    >
      {isUserOnline && (
        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
      )}
    </span>
  );
}
export default PresenceIndicator;
