import * as React from 'react';

export function TicketDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-hidden="true">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-6 w-32 bg-muted rounded" />
          <div className="h-4 w-48 bg-muted rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-20 bg-muted rounded" />
          <div className="h-9 w-24 bg-muted rounded" />
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Aside */}
        <div className="lg:col-span-3 space-y-4">
          <div className="h-32 rounded-xl border bg-card p-4 space-y-3">
            <div className="h-4 w-1/2 bg-muted rounded" />
            <div className="h-6 w-full bg-muted rounded" />
            <div className="h-4 w-3/4 bg-muted rounded" />
          </div>
          <div className="h-40 rounded-xl border bg-card p-4 space-y-3">
            <div className="h-4 w-1/3 bg-muted rounded" />
            <div className="h-10 w-full bg-muted rounded" />
            <div className="h-6 w-full bg-muted rounded" />
          </div>
        </div>

        {/* Center Main */}
        <div className="lg:col-span-6 space-y-4">
          <div className="h-48 rounded-xl border bg-card p-4 space-y-4">
            <div className="h-5 w-1/4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-5/6" />
          </div>
          <div className="h-32 rounded-xl border bg-card p-4 space-y-3">
            <div className="h-4 w-1/3 bg-muted rounded" />
            <div className="h-12 bg-muted rounded" />
          </div>
        </div>

        {/* Right Aside */}
        <div className="lg:col-span-3 space-y-4">
          <div className="h-28 rounded-xl border bg-card p-4 space-y-3">
            <div className="h-4 w-1/2 bg-muted rounded" />
            <div className="h-6 w-full bg-muted rounded animate-pulse" />
          </div>
          <div className="h-36 rounded-xl border bg-card p-4 space-y-3">
            <div className="h-4 w-1/3 bg-muted rounded" />
            <div className="h-6 w-full bg-muted rounded" />
            <div className="h-6 w-full bg-muted rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
export default TicketDetailSkeleton;
