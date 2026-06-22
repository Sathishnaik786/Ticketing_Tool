import { Link } from 'react-router-dom';
import { PageHeader, MetricCard, ActivityTimeline, LoadingState, ErrorState } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { ShieldCheck, AlertTriangle, Clock, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchEtmsSlaStats } from '../services/etmsDashboardService';
import { isEtmsDashboardEnabled } from '@/config/features';

export default function SlaDashboardPage() {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['etms-sla-stats'],
    queryFn: fetchEtmsSlaStats,
    enabled: isEtmsDashboardEnabled,
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <LoadingState label="Loading SLA dashboard" variant="skeleton" rows={3} />
      </div>
    );
  }

  const compliance = stats?.slaCompliancePercent ?? 94.2;
  const breaches = stats?.ticketsByStatus?.open ?? 7;
  const atRisk = (stats?.ticketsByStatus?.inProgress ?? 0) + (stats?.departmentPerformance?.filter((d) => d.slaPercent < 90).length ?? 0);

  const deptActivity = (stats?.departmentPerformance ?? []).map((dept, i) => ({
    id: `dept-${i}`,
    title: `${dept.department}: ${dept.slaPercent}% SLA compliance`,
    description: `${dept.open} open tickets · avg ${dept.avgResolutionHours}h resolution`,
    timestamp: new Date(Date.now() - i * 3600000).toISOString(),
    tone: dept.slaPercent < 90 ? ('warning' as const) : ('success' as const),
  }));

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <PageHeader
        title="SLA Command Center"
        description="Monitor SLA compliance, breaches, and at-risk tickets across departments."
        breadcrumbs={[
          { label: 'Analytics', href: '/app/executive-dashboard' },
          { label: 'SLA' },
        ]}
        badge={
          stats?.isDemoData ? (
            <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
              Demo Data
            </span>
          ) : undefined
        }
        actions={
          <Button asChild variant="outline" size="sm">
            <Link to="/app/tickets?scope=all">View All Tickets</Link>
          </Button>
        }
      />

      {isError && (
        <ErrorState title="SLA data unavailable" message="Unable to load SLA metrics." variant="compact" />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          label="SLA Compliance"
          value={`${compliance}%`}
          icon={ShieldCheck}
          tone="success"
          trend={{ value: '+1.2%', direction: 'up', label: 'vs last week' }}
        />
        <MetricCard
          label="Active Breaches"
          value={breaches}
          icon={AlertTriangle}
          tone="danger"
        />
        <MetricCard
          label="At-Risk Tickets"
          value={atRisk}
          icon={Clock}
          tone="warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-xl border border-border bg-card p-4" aria-label="Department SLA performance">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-primary" aria-hidden />
            <h2 className="text-sm font-semibold">Department Performance</h2>
          </div>
          <ActivityTimeline
            items={deptActivity}
            emptyMessage="No department SLA data available."
            compact
          />
        </section>

        <section className="rounded-xl border border-border bg-card p-4" aria-label="Ticket status breakdown">
          <h2 className="text-sm font-semibold mb-4">Status Breakdown</h2>
          <dl className="grid grid-cols-2 gap-4">
            {stats?.ticketsByStatus &&
              Object.entries(stats.ticketsByStatus).map(([key, value]) => (
                <div key={key} className="rounded-lg bg-muted/50 p-3">
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </dt>
                  <dd className="text-xl font-bold mt-1">{value}</dd>
                </div>
              ))}
          </dl>
        </section>
      </div>
    </div>
  );
}
