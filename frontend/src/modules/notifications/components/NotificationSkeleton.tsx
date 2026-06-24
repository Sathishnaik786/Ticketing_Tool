import * as React from 'react';

export function NotificationSkeleton() {
  return (
    <div className="space-y-4" aria-label="Loading notifications" role="status" aria-live="polite">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-start gap-4 p-4 rounded-xl border border-border/40 bg-card/50 animate-pulse"
        >
          <div className="h-10 w-10 rounded-xl bg-muted shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between items-start gap-4">
              <div className="h-4 w-1/3 bg-muted rounded" />
              <div className="h-3 w-16 bg-muted rounded" />
            </div>
            <div className="h-3 w-3/4 bg-muted rounded" />
            <div className="h-3 w-1/2 bg-muted rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
export default NotificationSkeleton;
