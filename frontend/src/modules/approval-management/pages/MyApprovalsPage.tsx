import { PageHeader } from '@/components/layout/PageHeader';
import { ApprovalCard } from '../components/ApprovalCard';
import { useMyApprovals, usePendingApprovals } from '../hooks/useApprovalManagement';
import { DataTableSkeleton } from '@/components/common/Skeletons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function MyApprovalsPage() {
  const myApprovals = useMyApprovals();
  const pending = usePendingApprovals();

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <PageHeader
        title="My Approvals"
        description="Track submitted requests and approvals awaiting your action."
        className="enterprise-panel mb-0"
      />

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">Awaiting my action</TabsTrigger>
          <TabsTrigger value="submitted">My submissions</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="enterprise-panel">
          {pending.isLoading ? (
            <DataTableSkeleton />
          ) : !pending.data?.length ? (
            <p className="text-sm text-muted-foreground">No pending approvals assigned to you.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {pending.data.map((approval) => (
                <ApprovalCard key={approval.id} approval={approval} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="submitted" className="enterprise-panel">
          {myApprovals.isLoading ? (
            <DataTableSkeleton />
          ) : !myApprovals.data?.length ? (
            <p className="text-sm text-muted-foreground">You have not submitted any approval requests.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {myApprovals.data.map((approval) => (
                <ApprovalCard key={approval.id} approval={approval} showStep={false} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
