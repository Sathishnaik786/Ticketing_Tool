import { Link } from 'react-router-dom';
import { PageHeader, MetricCard, ActivityTimeline } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useEtmsDashboard } from '../hooks/useEtmsDashboard';
import { TicketStatusChart } from '../components/TicketStatusChart';
import { DepartmentPerformancePanel } from '../components/DepartmentPerformancePanel';
import { Plus, Ticket, FolderOpen, AlertTriangle, ShieldCheck, Clock, TrendingUp } from 'lucide-react';
import { isTicketingEnabled } from '@/config/features';

export function EtmsCommandDashboard() {
  const { data: stats, isLoading } = useEtmsDashboard();

  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const activityItems = stats.recentActivity.map((item) => ({
    id: item.id,
    title: item.message,
    timestamp: item.timestamp,
    tone: item.type === 'escalated' ? ('danger' as const) : item.type === 'resolved' ? ('success' as const) : ('default' as const),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ticketra Command Center"
        description="Enterprise Ticket Management System — real-time service operations"
        breadcrumbs={[{ label: 'Dashboard' }]}
        badge={
          stats.isDemoData ? (
            <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
              Demo Data
            </span>
          ) : undefined
        }
        actions={
          isTicketingEnabled ? (
            <Button asChild size="sm">
              <Link to="/app/tickets/new">
                <Plus className="h-4 w-4 mr-1" aria-hidden />
                Create Ticket
              </Link>
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <MetricCard label="Total Tickets" value={stats.totalTickets.toLocaleString()} icon={Ticket} tone="primary" />
        <MetricCard label="Open Tickets" value={stats.openTickets.toLocaleString()} icon={FolderOpen} tone="primary" />
        <MetricCard label="Overdue Tickets" value={stats.overdueTickets.toLocaleString()} icon={AlertTriangle} tone="danger" />
        <MetricCard label="SLA Compliance" value={`${stats.slaCompliancePercent}%`} icon={ShieldCheck} tone="success" />
        <MetricCard label="Pending Approvals" value={stats.pendingApprovals.toLocaleString()} icon={Clock} tone="warning" />
        <MetricCard label="Team Performance" value={`${stats.teamPerformanceScore}%`} icon={TrendingUp} tone="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TicketStatusChart stats={stats} />
        <DepartmentPerformancePanel stats={stats} />
      </div>

      <section className="rounded-xl border border-border bg-card p-4" aria-label="Recent activity feed">
        <h2 className="text-sm font-semibold mb-4">Live Activity Feed</h2>
        <ActivityTimeline items={activityItems} emptyMessage="No recent activity." />
      </section>
    </div>
  );
}
