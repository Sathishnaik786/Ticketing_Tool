import { PageHeader } from '@/components/layout/PageHeader';
import { KpiCards } from '../components/KpiCards';
import { ExportToolbar } from '../components/AnalyticsFilters';
import { useExecutiveDashboard, useTrendAnalytics, useCreateAnalyticsReport } from '../hooks/useExecutiveAnalytics';
import { DataTableSkeleton } from '@/components/common/Skeletons';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

const COLORS = ['#2563EB', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#64748B'];

export default function ExecutiveDashboardPage() {
  const { data, isLoading, isError } = useExecutiveDashboard();
  const trends = useTrendAnalytics();
  const createReport = useCreateAnalyticsReport();

  const handleExport = (format: 'CSV' | 'XLSX' | 'PDF' | 'JSON') => {
    createReport.mutate({
      name: `Executive Dashboard ${new Date().toISOString().slice(0, 10)}`,
      report_type: 'EXECUTIVE',
      format,
    });
  };

  const monthlyData = trends.data?.monthly || [
    { month: 'Jan', created: 120, closed: 110, slaPercent: 92 },
    { month: 'Feb', created: 150, closed: 130, slaPercent: 94 },
    { month: 'Mar', created: 180, closed: 160, slaPercent: 91 },
    { month: 'Apr', created: 220, closed: 210, slaPercent: 95 },
    { month: 'May', created: 240, closed: 235, slaPercent: 93 },
    { month: 'Jun', created: 270, closed: 260, slaPercent: 95.8 }
  ];

  const departmentData = [
    { name: 'IT Support', volume: 152, resolutionHrs: 4.8 },
    { name: 'HR Ops', volume: 92, resolutionHrs: 3.1 },
    { name: 'Finance', volume: 64, resolutionHrs: 5.6 },
    { name: 'Facilities', volume: 48, resolutionHrs: 2.4 },
    { name: 'Customer Care', volume: 184, resolutionHrs: 6.2 }
  ];

  const ratioData = [
    { name: 'Open', value: 142, color: '#2563EB' },
    { name: 'Closed', value: 830, color: '#10B981' }
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <PageHeader
        title="Executive Intelligence Dashboard"
        description="Comprehensive enterprise operational trends, SLA diagnostics, and business unit comparison."
        className="enterprise-panel mb-0"
      />

      <ExportToolbar onExport={handleExport} isExporting={createReport.isPending} />

      <section className="enterprise-panel space-y-6">
        {isLoading ? (
          <DataTableSkeleton />
        ) : isError ? (
          <p className="text-sm text-destructive">Unable to load executive KPIs.</p>
        ) : data?.kpis ? (
          <KpiCards kpis={data.kpis} />
        ) : null}
      </section>

      {/* SLA & Ticket Volume Area Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 min-h-[350px] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Ticket Volume & Growth Trend</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Historical created vs resolved tickets count</p>
          </div>
          <div className="flex-1 mt-4">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" className="hidden dark:block" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="created" stroke="#2563EB" fill="#2563EB" fillOpacity={0.05} strokeWidth={2} name="Created" />
                <Area type="monotone" dataKey="closed" stroke="#10B981" fill="#10B981" fillOpacity={0.05} strokeWidth={2} name="Closed" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SLA Trend Area Chart */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 min-h-[350px] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">SLA Compliance & CSAT Trend</h3>
            <p className="text-xs text-muted-foreground mt-0.5">SLA achievement percentage over time</p>
          </div>
          <div className="flex-1 mt-4">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" className="hidden dark:block" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis domain={[80, 100]} stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="slaPercent" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={2} name="SLA %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Department Comparison & Open vs Closed split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Department Volume and SLA Comparison */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 min-h-[350px] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Department Volume Comparison</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Average ticket load count across operational divisions</p>
          </div>
          <div className="flex-1 mt-4">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" className="hidden dark:block" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Bar dataKey="volume" fill="#2563EB" radius={[4, 4, 0, 0]} name="Ticket Volume" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ratio Chart (Open vs Closed) */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 min-h-[350px] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Open vs Closed Ratio</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Current operational ratio split</p>
          </div>
          <div className="flex-1 min-h-[220px] mt-4 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={ratioData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {ratioData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
export { ExecutiveDashboardPage };
