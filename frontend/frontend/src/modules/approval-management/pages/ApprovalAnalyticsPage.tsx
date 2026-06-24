import { PageHeader } from '@/components/layout/PageHeader';
import { useApprovalAnalytics } from '../hooks/useApprovalManagement';
import { DataTableSkeleton } from '@/components/common/Skeletons';

export default function ApprovalAnalyticsPage() {
  const { data, isLoading, isError } = useApprovalAnalytics();

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <PageHeader
        title="Approval Analytics"
        description="Approval volume and status breakdown for managers and administrators."
        className="enterprise-panel mb-0"
      />

      <section className="enterprise-panel space-y-6">
        {isLoading ? (
          <DataTableSkeleton />
        ) : isError ? (
          <p className="text-sm text-destructive">Unable to load approval analytics.</p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border p-4">
                <p className="text-xs uppercase text-muted-foreground">Total approvals</p>
                <p className="text-2xl font-semibold mt-1">{data?.totalApprovals ?? 0}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs uppercase text-muted-foreground">Pending</p>
                <p className="text-2xl font-semibold mt-1">{data?.pendingCount ?? 0}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs uppercase text-muted-foreground">Approved</p>
                <p className="text-2xl font-semibold mt-1">{data?.statusCounts?.APPROVED ?? 0}</p>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">Status breakdown</h2>
              <ul className="space-y-2">
                {Object.entries(data?.statusCounts ?? {}).map(([status, count]) => (
                  <li key={status} className="flex justify-between text-sm border-b py-2">
                    <span>{status}</span>
                    <span className="font-medium">{count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
