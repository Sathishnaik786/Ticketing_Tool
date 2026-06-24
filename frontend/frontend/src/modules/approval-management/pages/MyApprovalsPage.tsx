import * as React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ApprovalCard } from '../components/ApprovalCard';
import { useMyApprovals, usePendingApprovals } from '../hooks/useApprovalManagement';
import { DataTableSkeleton } from '@/components/common/Skeletons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MetricCard } from '@/components/design-system';
import { Clock, AlertCircle, CheckCircle, ListFilter, TrendingDown, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function MyApprovalsPage() {
  const myApprovals = useMyApprovals();
  const pending = usePendingApprovals();

  const allApprovals = React.useMemo(() => {
    const list = [...(pending.data ?? []), ...(myApprovals.data ?? [])];
    // De-duplicate items by id
    const unique = new Map();
    list.forEach((item) => {
      unique.set(item.id, item);
    });
    return Array.from(unique.values());
  }, [pending.data, myApprovals.data]);

  const approvedList = allApprovals.filter((a) => a.status === 'APPROVED');
  const rejectedList = allApprovals.filter((a) => a.status === 'REJECTED');
  const pendingList = allApprovals.filter((a) => a.status === 'PENDING');

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <PageHeader
        title="Service Desk Approvals"
        description="Verify service catalog requests, change controls, and payroll disbursements."
        className="enterprise-panel mb-0"
      />

      {/* JSM Approval Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <div className="flex justify-between items-start text-xs text-muted-foreground font-semibold uppercase">
            <span>Avg Decision Time</span>
            <Clock className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">4.2 Hours</p>
          <div className="flex items-center gap-1 text-[10px] text-green-600 font-medium">
            <TrendingDown className="h-3.5 w-3.5" />
            <span>12% faster than last week</span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <div className="flex justify-between items-start text-xs text-muted-foreground font-semibold uppercase">
            <span>Average Delay</span>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">1.8 Days</p>
          <div className="flex items-center gap-1 text-[10px] text-amber-600 font-medium">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>0.2 days increase</span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <div className="flex justify-between items-start text-xs text-muted-foreground font-semibold uppercase">
            <span>Completion %</span>
            <CheckCircle className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">96.4%</p>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
            <span>Stable compliance rate</span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <div className="flex justify-between items-start text-xs text-muted-foreground font-semibold uppercase">
            <span>Active Workflows</span>
            <ListFilter className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">{pendingList.length}</p>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
            <span>Awaiting signature</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-6">
        <div className="flex justify-between items-center border-b border-border pb-2">
          <TabsList className="h-9">
            <TabsTrigger value="pending" className="text-xs">
              Pending ({pendingList.length})
            </TabsTrigger>
            <TabsTrigger value="approved" className="text-xs">
              Approved ({approvedList.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="text-xs">
              Rejected ({rejectedList.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="text-xs">
              All ({allApprovals.length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Pending Content */}
        <TabsContent value="pending" className="enterprise-panel">
          {pending.isLoading ? (
            <DataTableSkeleton />
          ) : pendingList.length === 0 ? (
            <p className="text-xs text-muted-foreground italic text-center py-6">No pending approvals awaiting your action.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {pendingList.map((approval) => (
                <ApprovalCard key={approval.id} approval={approval} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Approved Content */}
        <TabsContent value="approved" className="enterprise-panel">
          {myApprovals.isLoading ? (
            <DataTableSkeleton />
          ) : approvedList.length === 0 ? (
            <p className="text-xs text-muted-foreground italic text-center py-6">No approved workflows recorded.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {approvedList.map((approval) => (
                <ApprovalCard key={approval.id} approval={approval} showStep={false} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Rejected Content */}
        <TabsContent value="rejected" className="enterprise-panel">
          {myApprovals.isLoading ? (
            <DataTableSkeleton />
          ) : rejectedList.length === 0 ? (
            <p className="text-xs text-muted-foreground italic text-center py-6">No rejected workflows recorded.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {rejectedList.map((approval) => (
                <ApprovalCard key={approval.id} approval={approval} showStep={false} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* All Content */}
        <TabsContent value="all" className="enterprise-panel">
          {myApprovals.isLoading ? (
            <DataTableSkeleton />
          ) : allApprovals.length === 0 ? (
            <p className="text-xs text-muted-foreground italic text-center py-6">No approvals logged in the system.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {allApprovals.map((approval) => (
                <ApprovalCard key={approval.id} approval={approval} showStep={approval.status === 'PENDING'} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
