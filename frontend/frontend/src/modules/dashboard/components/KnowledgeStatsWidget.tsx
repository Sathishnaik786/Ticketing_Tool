import { BookOpen, HelpCircle } from 'lucide-react';
import type { KnowledgeStats } from '../types/dashboard.types';

interface KnowledgeStatsWidgetProps {
  stats?: KnowledgeStats;
  loading?: boolean;
}

export function KnowledgeStatsWidget({ stats, loading = false }: KnowledgeStatsWidgetProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 animate-pulse">
        <div className="h-5 w-44 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-[150px] w-full bg-slate-100 dark:bg-slate-800 rounded-xl" />
      </div>
    );
  }

  const isEmpty = !stats || stats.totalArticles === 0;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between min-h-[320px]">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Self-Service Portal Stats</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Knowledge article efficacy & user deflection metrics</p>
      </div>

      {isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center" role="status">
          <BookOpen className="h-8 w-8 text-slate-400 dark:text-slate-600 mb-2" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Knowledge base is empty.</p>
          <p className="text-xs text-muted-foreground mt-1">Write self-service resources to deflect service desk volume.</p>
        </div>
      ) : (
        <div className="flex-1 mt-4 flex flex-col justify-between">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-center">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalArticles}</span>
              <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider mt-1">Total Articles</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-center">
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {stats.helpfulRatingsPercent}%
              </span>
              <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider mt-1">Helpful Score</p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Top Categories</h4>
            <div className="space-y-2">
              {stats.topCategories.slice(0, 3).map((item) => (
                <div key={item.category} className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{item.category}</span>
                  <span className="font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                    {item.count} articles
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
