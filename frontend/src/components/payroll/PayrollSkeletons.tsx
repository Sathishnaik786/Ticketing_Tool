import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { EnterpriseCard } from './EnterpriseComponents';

export const PayrollTableSkeleton = ({ rows = 5, cols = 6 }: { rows?: number, cols?: number }) => (
  <div className="rounded-[2rem] border border-border-soft overflow-hidden bg-white/5">
    <div className="p-6 border-b border-border-soft flex items-center justify-between bg-white/[0.02]">
      <Skeleton className="h-10 w-64 rounded-xl" />
      <div className="flex gap-2">
        <Skeleton className="h-10 w-24 rounded-xl" />
        <Skeleton className="h-10 w-24 rounded-xl" />
      </div>
    </div>
    <div className="p-0">
      <div className="space-y-0">
        {Array(rows).fill(0).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-6 border-b border-border-soft last:border-0">
            {Array(cols).fill(0).map((_, j) => (
              <Skeleton key={j} className="h-6 flex-1 rounded-lg" />
            ))}
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const PayrollCardSkeleton = () => (
  <EnterpriseCard className="h-48">
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-2xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24 rounded-full" />
          <Skeleton className="h-8 w-32 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-4 w-full rounded-full" />
      <Skeleton className="h-4 w-2/3 rounded-full" />
    </div>
  </EnterpriseCard>
);

export const PayrollDashboardSkeleton = () => (
  <div className="space-y-10 animate-in fade-in duration-500">
    <div className="space-y-4">
      <Skeleton className="h-12 w-64 rounded-2xl" />
      <Skeleton className="h-6 w-96 rounded-2xl" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {Array(4).fill(0).map((_, i) => (
        <Skeleton key={i} className="h-32 rounded-[2rem]" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <Skeleton className="lg:col-span-2 h-[400px] rounded-[2.5rem]" />
      <Skeleton className="h-[400px] rounded-[2.5rem]" />
    </div>
  </div>
);
