import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTableSkeleton } from '@/components/common/Skeletons';
import { useMyQueue, useAssignmentAnalytics } from '../hooks/useTicketAssignment';
import { QueueTicketTable } from '../components/QueueTicketTable';

export default function MyQueuePage() {
  const { data, isLoading } = useMyQueue({ page: 1, limit: 50 });
  const { data: analytics } = useAssignmentAnalytics();

  if (isLoading) {
    return (
      <div className="p-8">
        <DataTableSkeleton />
      </div>
    );
  }

  const tickets = data?.data ?? [];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <PageHeader
        title="My Queue"
        description="Tickets currently assigned to you"
        className="enterprise-panel mb-0"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="enterprise-panel">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Assigned To Me</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black">{data?.meta?.total ?? tickets.length}</p>
          </CardContent>
        </Card>
      </div>

      <QueueTicketTable tickets={tickets} emptyMessage="No tickets assigned to you." />
    </div>
  );
}
