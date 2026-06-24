import { formatDistanceToNow } from 'date-fns';
import type { EtmsDashboardStats } from '../services/etmsDashboardService';

interface EtmsActivityFeedProps {
  stats: EtmsDashboardStats;
}

export function EtmsActivityFeed({ stats }: EtmsActivityFeedProps) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Recent Activity</h3>
      <ul className="space-y-3" aria-label="Recent ticket activity">
        {stats.recentActivity.map((item) => (
          <li key={item.id} className="flex items-start gap-3 text-sm">
            <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 shrink-0" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-slate-800 dark:text-slate-200">{item.message}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
