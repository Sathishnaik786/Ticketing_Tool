import React, { memo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DepartmentPerformanceData } from '../types/dashboard.types';

interface DepartmentPerformancePanelProps {
  performanceList?: DepartmentPerformanceData[];
  loading?: boolean;
}

const trendColors = {
  up: 'text-emerald-600 dark:text-emerald-400',
  down: 'text-rose-600 dark:text-rose-400',
  stable: 'text-slate-500 dark:text-slate-400',
};

const TrendIcon = ({ direction }: { direction: 'up' | 'down' | 'stable' }) => {
  if (direction === 'up') return <TrendingUp className="h-4 w-4 shrink-0" aria-label="Improving" />;
  if (direction === 'down') return <TrendingDown className="h-4 w-4 shrink-0" aria-label="Slowing" />;
  return <Minus className="h-4 w-4 shrink-0" aria-label="Stable" />;
};

export const DepartmentPerformancePanel = memo(function DepartmentPerformancePanel({ performanceList = [], loading = false }: DepartmentPerformancePanelProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 animate-pulse">
        <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 w-full bg-slate-100 dark:bg-slate-800 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const isEmpty = performanceList.length === 0;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between min-h-[320px]">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Departmental Performance Matrix</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Throughput and service level indicators per department</p>
      </div>

      {isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center" role="status">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Everything looks good.</p>
          <p className="text-xs text-muted-foreground mt-1">No department statistics found.</p>
        </div>
      ) : (
        <div className="flex-1 mt-4 overflow-x-auto scrollbar-premium">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                <th className="py-2.5 font-semibold">Department</th>
                <th className="py-2.5 font-semibold text-center">Tickets</th>
                <th className="py-2.5 font-semibold text-right">Avg Resolution</th>
                <th className="py-2.5 font-semibold text-right px-4">SLA Compliance</th>
                <th className="py-2.5 font-semibold text-center">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {performanceList.map((dept) => (
                <tr key={dept.department} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 font-medium text-slate-900 dark:text-white">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      {dept.department}
                    </span>
                  </td>
                  <td className="py-3 text-center text-slate-600 dark:text-slate-300 font-semibold">{dept.open}</td>
                  <td className="py-3 text-right text-slate-600 dark:text-slate-300">{dept.avgResolutionHours}h</td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-3 px-4">
                      <div className="w-20 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden shrink-0 hidden sm:block">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            dept.slaPercent >= 90 ? 'bg-emerald-500' : dept.slaPercent >= 80 ? 'bg-amber-500' : 'bg-rose-500'
                          )}
                          style={{ width: `${dept.slaPercent}%` }}
                        />
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white text-xs">{dept.slaPercent}%</span>
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    <span className={cn('inline-flex justify-center', trendColors[dept.trend])}>
                      <TrendIcon direction={dept.trend} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});
