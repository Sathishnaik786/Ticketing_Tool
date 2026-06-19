import type { EtmsDashboardStats } from '../services/etmsDashboardService';

interface DepartmentPerformancePanelProps {
  stats: EtmsDashboardStats;
}

export function DepartmentPerformancePanel({ stats }: DepartmentPerformancePanelProps) {
  const maxOpen = Math.max(...stats.departmentPerformance.map((d) => d.open), 1);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Department Performance</h3>
      <div className="space-y-4">
        {stats.departmentPerformance.map((dept) => (
          <div key={dept.department}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-slate-800 dark:text-slate-200">{dept.department}</span>
              <span className="text-slate-500">{dept.slaPercent}% SLA</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-600"
                style={{ width: `${(dept.open / maxOpen) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">{dept.open} open · avg {dept.avgResolutionHours}h resolution</p>
          </div>
        ))}
      </div>
    </div>
  );
}
