import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTableSkeleton } from '@/components/common/Skeletons';
import { useAuth } from '@/contexts/AuthContext';
import { useTeamQueue, useUnassignedQueue, useAssignmentAnalytics } from '../hooks/useTicketAssignment';
import { QueueTicketTable } from '../components/QueueTicketTable';

export default function TeamQueuePage() {
  const { user } = useAuth();
  const canView = user?.role === 'MANAGER' || user?.role === 'ADMIN' || user?.role === 'HR';

  const { data: teamData, isLoading: teamLoading } = useTeamQueue({ page: 1, limit: 50 });
  const { data: unassignedData, isLoading: unassignedLoading } = useUnassignedQueue({ page: 1, limit: 50 });
  const { data: analyticsData } = useAssignmentAnalytics();

  if (!canView) {
    return (
      <div className="p-8">
        <p className="text-sm text-destructive" role="alert">You do not have access to the team queue.</p>
      </div>
    );
  }

  if (teamLoading || unassignedLoading) {
    return (
      <div className="p-8">
        <DataTableSkeleton />
      </div>
    );
  }

  const analytics = analyticsData?.data;

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <PageHeader
        title="Team Queue"
        description="Department workload and unassigned tickets"
        className="enterprise-panel mb-0"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="enterprise-panel">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Team Queue</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-black">{teamData?.meta?.total ?? 0}</p></CardContent>
        </Card>
        <Card className="enterprise-panel">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Unassigned</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-black">{unassignedData?.meta?.total ?? 0}</p></CardContent>
        </Card>
        <Card className="enterprise-panel">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">All Assigned</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-black">{analytics?.totalAssigned ?? 0}</p></CardContent>
        </Card>
        <Card className="enterprise-panel">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Overloaded Agents</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-black">{analytics?.overloadedAgents?.length ?? 0}</p></CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <h2 className="enterprise-subheading">Department Tickets</h2>
        <QueueTicketTable tickets={teamData?.data ?? []} />
      </section>

      <section className="space-y-4">
        <h2 className="enterprise-subheading">Unassigned Tickets</h2>
        <QueueTicketTable tickets={unassignedData?.data ?? []} emptyMessage="No unassigned tickets." />
      </section>
    </div>
  );
}
