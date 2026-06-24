import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTableSkeleton } from '@/components/common/Skeletons';
import { useAssignmentAnalytics } from '../hooks/useTicketAssignment';

export default function AssignmentAnalyticsPage() {
  const { data, isLoading } = useAssignmentAnalytics();
  const analytics = data?.data;

  if (isLoading) {
    return (
      <div className="p-8">
        <DataTableSkeleton />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <PageHeader
        title="Assignment Analytics"
        description="Workload distribution and assignment trends"
        className="enterprise-panel mb-0"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Assignment Count" value={String(analytics?.assignmentCount ?? 0)} />
        <MetricCard title="Average Queue Size" value={String(analytics?.averageQueueSize ?? 0)} />
        <MetricCard title="Total Assigned" value={String(analytics?.totalAssigned ?? 0)} />
        <MetricCard title="Total Unassigned" value={String(analytics?.totalUnassigned ?? 0)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RankingCard title="Tickets Per Agent" items={analytics?.ticketsPerAgent ?? []} />
        <RankingCard title="Department Workload" items={analytics?.departmentWorkload ?? []} />
      </div>

      <Card className="enterprise-panel">
        <CardHeader><CardTitle>Assignment Trends</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {(analytics?.assignmentTrend ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No assignment history yet.</p>
          ) : (
            analytics?.assignmentTrend.map((row) => (
              <div key={row.month} className="flex justify-between border-b border-border/40 pb-2">
                <span>{row.month}</span>
                <span className="font-semibold">{row.count} assignments</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ title, value }: { title: string; value: string }) {
  return (
    <Card className="enterprise-panel">
      <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{title}</CardTitle></CardHeader>
      <CardContent><p className="text-3xl font-black">{value}</p></CardContent>
    </Card>
  );
}

function RankingCard({
  title,
  items,
}: {
  title: string;
  items: Array<{ agentId?: string; departmentId?: string; count: number }>;
}) {
  return (
    <Card className="enterprise-panel">
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data.</p>
        ) : (
          items.map((item) => (
            <div key={item.agentId || item.departmentId} className="flex justify-between">
              <span className="text-sm truncate">{item.agentId || item.departmentId}</span>
              <span className="font-semibold">{item.count}</span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
