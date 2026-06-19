import {
  Ticket,
  FolderOpen,
  AlertTriangle,
  ShieldCheck,
  Clock,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EtmsDashboardStats } from '../services/etmsDashboardService';

interface KpiItem {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: 'primary' | 'success' | 'warning' | 'danger';
}

interface EtmsKpiGridProps {
  stats: EtmsDashboardStats;
}

const toneClasses = {
  primary: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  danger: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300',
};

export function EtmsKpiGrid({ stats }: EtmsKpiGridProps) {
  const items: KpiItem[] = [
    { label: 'Total Tickets', value: stats.totalTickets.toLocaleString(), icon: Ticket, tone: 'primary' },
    { label: 'Open Tickets', value: stats.openTickets.toLocaleString(), icon: FolderOpen, tone: 'primary' },
    { label: 'Overdue Tickets', value: stats.overdueTickets.toLocaleString(), icon: AlertTriangle, tone: 'danger' },
    { label: 'SLA Compliance', value: `${stats.slaCompliancePercent}%`, icon: ShieldCheck, tone: 'success' },
    { label: 'Pending Approvals', value: stats.pendingApprovals.toLocaleString(), icon: Clock, tone: 'warning' },
    { label: 'Team Performance', value: `${stats.teamPerformanceScore}%`, icon: TrendingUp, tone: 'success' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {items.map(({ label, value, icon: Icon, tone = 'primary' }) => (
        <div
          key={label}
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex items-start gap-4"
        >
          <div className={cn('p-2.5 rounded-xl', toneClasses[tone])}>
            <Icon className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
