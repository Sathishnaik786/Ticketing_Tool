import type { EtmsDashboardStats } from '../services/etmsDashboardService';

const STATUS_COLORS = {
  open: '#2563EB',
  inProgress: '#F59E0B',
  resolved: '#10B981',
  closed: '#64748B',
};

interface TicketStatusChartProps {
  stats: EtmsDashboardStats;
}

export function TicketStatusChart({ stats }: TicketStatusChartProps) {
  const segments = [
    { key: 'open', label: 'Open', value: stats.ticketsByStatus.open, color: STATUS_COLORS.open },
    { key: 'inProgress', label: 'In Progress', value: stats.ticketsByStatus.inProgress, color: STATUS_COLORS.inProgress },
    { key: 'resolved', label: 'Resolved', value: stats.ticketsByStatus.resolved, color: STATUS_COLORS.resolved },
    { key: 'closed', label: 'Closed', value: stats.ticketsByStatus.closed, color: STATUS_COLORS.closed },
  ];
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Ticket Status</h3>
      <div className="flex h-3 rounded-full overflow-hidden mb-4" role="img" aria-label="Ticket status distribution">
        {segments.map((s) => (
          <div
            key={s.key}
            style={{ width: `${(s.value / total) * 100}%`, backgroundColor: s.color }}
            title={`${s.label}: ${s.value}`}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {segments.map((s) => (
          <div key={s.key} className="flex items-center gap-2 text-sm">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} aria-hidden />
            <span className="text-slate-600 dark:text-slate-400">{s.label}</span>
            <span className="ml-auto font-semibold text-slate-900 dark:text-white">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
