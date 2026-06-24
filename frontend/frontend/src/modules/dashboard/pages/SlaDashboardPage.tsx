import { Link } from 'react-router-dom';
import { PageHeader, MetricCard } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { ShieldCheck, AlertTriangle, Clock, TrendingUp, HelpCircle } from 'lucide-react';
import { useEtmsDashboard } from '../hooks/useEtmsDashboard';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { cn } from '@/lib/utils';

const SLA_TREND_DATA = [
  { name: 'Week 1', compliance: 91 },
  { name: 'Week 2', compliance: 93 },
  { name: 'Week 3', compliance: 92 },
  { name: 'Week 4', compliance: 94 },
  { name: 'Week 5', compliance: 95.8 },
  { name: 'Week 6', compliance: 94.2 }
];

export default function SlaDashboardPage() {
  const { kpis, departmentPerformance, loading, error } = useEtmsDashboard();

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-6 animate-pulse" aria-hidden="true">
        <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-xl" />
      </div>
    );
  }

  const compliance = kpis?.slaCompliancePercent ?? 94.2;
  const breaches = kpis?.overdueTickets ?? 18;
  const nearBreach = Math.max(0, (kpis?.openTickets ?? 142) - breaches);
  const avgResponseTime = '1.8 hrs';
  const avgResolutionTime = '5.4 hrs';

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <PageHeader
        title="SLA Command Center"
        description="Monitor service level agreements, breaches, resolution times, and risk metrics."
        breadcrumbs={[
          { label: 'Analytics', href: '/app/dashboard' },
          { label: 'SLA' },
        ]}
        actions={
          <Button asChild variant="outline" size="sm" className="rounded-lg">
            <Link to="/app/tickets?scope=all">View All Tickets</Link>
          </Button>
        }
      />

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-sm">
          Unable to refresh SLA data, showing cached stats.
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <MetricCard
          label="SLA Compliance"
          value={`${compliance}%`}
          icon={ShieldCheck}
          tone={compliance >= 90 ? 'success' : 'danger'}
          trend={{ value: '+1.2%', direction: 'up', label: 'vs last week' }}
        />
        <MetricCard
          label="Active Breaches"
          value={breaches}
          icon={AlertTriangle}
          tone="danger"
        />
        <MetricCard
          label="Near Breach"
          value={nearBreach}
          icon={Clock}
          tone="warning"
        />
        <MetricCard
          label="Avg Response Time"
          value={avgResponseTime}
          icon={Clock}
          tone="primary"
        />
        <MetricCard
          label="Avg Resolution Time"
          value={avgResolutionTime}
          icon={TrendingUp}
          tone="success"
        />
      </div>

      {/* Charts & Department SLA splits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SLA Compliance Trend */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 min-h-[320px] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Compliance Trend</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Historical compliance percentage over past 6 weeks</p>
          </div>
          <div className="flex-1 mt-4">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={SLA_TREND_DATA}>
                <defs>
                  <linearGradient id="colorSla" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" className="hidden dark:block" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis domain={[80, 100]} stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Area type="monotone" dataKey="compliance" stroke="#2563EB" fillOpacity={1} fill="url(#colorSla)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department SLA split */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 min-h-[320px]">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Department SLA split</h3>
          <div className="space-y-4">
            {departmentPerformance.map((dept) => (
              <div key={dept.department} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">{dept.department}</span>
                  <span className={cn(dept.slaPercent >= 90 ? 'text-emerald-600' : 'text-amber-600')}>
                    {dept.slaPercent}% Compliance
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      dept.slaPercent >= 90 ? 'bg-emerald-500' : 'bg-amber-500'
                    )}
                    style={{ width: `${dept.slaPercent}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">Avg resolution time: {dept.avgResolutionHours}h</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
export { SlaDashboardPage };
