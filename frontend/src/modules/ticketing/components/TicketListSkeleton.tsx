import * as React from 'react';

export function TicketListSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-hidden="true">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-muted rounded" />
          <div className="h-4 w-72 bg-muted rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-24 bg-muted rounded" />
          <div className="h-9 w-32 bg-muted rounded" />
        </div>
      </div>

      {/* Filter Bar Skeleton */}
      <div className="h-16 rounded-xl border bg-card p-4 flex gap-3">
        <div className="h-8 bg-muted rounded flex-1" />
        <div className="h-8 w-28 bg-muted rounded" />
        <div className="h-8 w-28 bg-muted rounded" />
      </div>

      {/* Quick Chips Skeleton */}
      <div className="flex gap-2">
        <div className="h-8 w-16 bg-muted rounded-full" />
        <div className="h-8 w-20 bg-muted rounded-full" />
        <div className="h-8 w-16 bg-muted rounded-full" />
        <div className="h-8 w-24 bg-muted rounded-full" />
      </div>

      {/* Table Rows Skeletons */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="h-10 bg-muted/60 border-b" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 border-b flex items-center px-4 gap-4">
            <div className="h-4 w-4 bg-muted rounded" />
            <div className="h-4 w-16 bg-muted rounded font-mono" />
            <div className="h-4 bg-muted rounded flex-1" />
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-4 w-20 bg-muted rounded" />
            <div className="h-4 w-24 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
export default TicketListSkeleton;
