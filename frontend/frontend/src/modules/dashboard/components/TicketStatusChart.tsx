import React, { memo, useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import type { TicketStatusData } from '../types/dashboard.types';

interface TicketStatusChartProps {
  stats?: TicketStatusData;
  loading?: boolean;
}

const COLORS = {
  open: '#2563EB',
  inProgress: '#3B82F6',
  waiting: '#F59E0B',
  resolved: '#10B981',
  closed: '#64748B'
};

export const TicketStatusChart = memo(function TicketStatusChart({ stats, loading = false }: TicketStatusChartProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 min-h-[320px] flex items-center justify-center animate-pulse">
        <div className="h-40 w-40 rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-blue-500 animate-spin" />
      </div>
    );
  }

  const data = useMemo(() => {
    return stats
      ? [
          { name: 'Open', value: stats.open, color: COLORS.open },
          { name: 'In Progress', value: stats.inProgress, color: COLORS.inProgress },
          { name: 'Waiting', value: stats.waiting, color: COLORS.waiting },
          { name: 'Resolved', value: stats.resolved, color: COLORS.resolved },
          { name: 'Closed', value: stats.closed, color: COLORS.closed }
        ].filter(item => item.value > 0)
      : [];
  }, [stats]);

  const isEmpty = data.length === 0;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 min-h-[320px] flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Ticket Status Distribution</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Real-time load split across operational categories</p>
      </div>

      {isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center" role="status">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Everything looks good.</p>
          <p className="text-xs text-muted-foreground mt-1">No tickets match this layout filter.</p>
        </div>
      ) : (
        <div className="flex-1 min-h-[220px] w-full mt-4">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-surface, #fff)',
                  borderColor: 'var(--color-border, #e2e8f0)',
                  borderRadius: '12px',
                  color: 'inherit'
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
});
