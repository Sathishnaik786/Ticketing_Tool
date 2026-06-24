import { Link } from 'react-router-dom';
import { ApprovalCard } from './ApprovalCard';
import { usePendingApprovals } from '../hooks/useApprovalManagement';
import { DataTableSkeleton } from '@/components/common/Skeletons';

export function PendingApprovalsWidget() {
  const { data, isLoading, isError } = usePendingApprovals();

  if (isLoading) return <DataTableSkeleton />;
  if (isError) return <p className="text-sm text-destructive">Unable to load pending approvals.</p>;

  const pending = data ?? [];

  return (
    <section className="enterprise-panel space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Pending Approvals</h2>
        <Link to="/app/my-approvals" className="text-sm text-primary hover:underline">
          View all
        </Link>
      </div>
      {pending.length === 0 ? (
        <p className="text-sm text-muted-foreground">No approvals awaiting your action.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {pending.slice(0, 4).map((approval) => (
            <ApprovalCard key={approval.id} approval={approval} />
          ))}
        </div>
      )}
    </section>
  );
}
