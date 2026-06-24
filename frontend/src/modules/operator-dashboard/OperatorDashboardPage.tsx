import { Link } from 'react-router-dom';
import { PageHeader, MetricCard, ActivityTimeline, LoadingState, ErrorState } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { Inbox, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { isTicketingEnabled, isTicketAssignmentsEnabled } from '@/config/features';
import { useEtmsDashboard } from '@/modules/dashboard/hooks/useEtmsDashboard';
import type { RecentActivityItem } from '@/modules/dashboard/types/dashboard.types';

export default function OperatorDashboardPage() {
  const { kpis, activities, loading, error } = useEtmsDashboard();

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <LoadingState label="Loading operator dashboard" variant="skeleton" rows={3} />
      </div>
    );
  }

  const assignedCount = kpis?.openTickets ?? '—';
  const overdueCount = kpis?.overdueTickets ?? '—';
  const pendingCount = kpis?.pendingApprovals ?? '—';

  const activityItems = (activities ?? []).map((item: RecentActivityItem) => ({
    id: item.id,
    title: item.message,
    timestamp: item.timestamp,
    tone: item.type === 'sla_breach' ? ('danger' as const) : item.type === 'approval_complete' ? ('success' as const) : ('default' as const),
  }));

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Operator Command Center"
        description="Your daily work surface — assigned tickets, overdue items, and pending actions."
        breadcrumbs={[
          { label: 'Dashboard', href: '/app/dashboard' },
          { label: 'Operator' },
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            {isTicketAssignmentsEnabled && (
              <Button asChild variant="outline" size="sm">
                <Link to="/app/my-queue">Open My Queue</Link>
              </Button>
            )}
            {isTicketingEnabled && (
              <Button asChild size="sm">
                <Link to="/app/tickets/new">Create Ticket</Link>
              </Button>
            )}
          </div>
        }
      />

      {error && (
        <ErrorState title="Dashboard unavailable" message="Unable to load operator metrics." variant="compact" />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          label="Assigned To Me"
          value={assignedCount}
          icon={Inbox}
          tone="primary"
          href="/app/my-queue"
        />
        <MetricCard
          label="Overdue"
          value={overdueCount}
          icon={AlertTriangle}
          tone="danger"
          href="/app/my-queue"
          trend={typeof overdueCount === 'number' && overdueCount > 0 ? { value: 'Needs attention', direction: 'up' } : undefined}
        />
        <MetricCard
          label="Pending Actions"
          value={pendingCount}
          icon={Clock}
          tone="warning"
          href="/app/my-approvals"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-xl border border-border bg-card p-4" aria-label="Recent activity">
          <h2 className="text-sm font-semibold mb-4">Recent Activity</h2>
          <ActivityTimeline
            items={activityItems}
            emptyMessage="No recent activity."
            compact
          />
        </section>

        <section className="rounded-xl border border-border bg-card p-4" aria-label="Quick actions">
          <h2 className="text-sm font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {isTicketAssignmentsEnabled && (
              <Button asChild variant="outline" className="justify-start h-auto py-3">
                <Link to="/app/my-queue">
                  <Inbox className="h-4 w-4 mr-2" aria-hidden />
                  My Queue
                </Link>
              </Button>
            )}
            {isTicketingEnabled && (
              <Button asChild variant="outline" className="justify-start h-auto py-3">
                <Link to="/app/tickets?scope=mine">
                  <CheckCircle2 className="h-4 w-4 mr-2" aria-hidden />
                  My Tickets
                </Link>
              </Button>
            )}
            <Button asChild variant="outline" className="justify-start h-auto py-3">
              <Link to="/app/my-approvals">
                <Clock className="h-4 w-4 mr-2" aria-hidden />
                My Approvals
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
export { OperatorDashboardPage };
