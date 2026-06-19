import { isApprovalEngineEnabled } from '@/config/features';
import { TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ApprovalWorkflowView } from './ApprovalWorkflowView';
import { ApprovalHistoryPanel } from './ApprovalHistoryPanel';
import {
  useTicketApprovalState,
  useApproveTicketStep,
  useRejectTicketStep,
} from '../hooks/useApprovalManagement';
import { DataTableSkeleton } from '@/components/common/Skeletons';
import { Badge } from '@/components/ui/badge';

interface TicketApprovalTabProps {
  ticketId: string;
}

export function TicketApprovalTabTrigger() {
  if (!isApprovalEngineEnabled) return null;
  return <TabsTrigger value="approval-workflow">Approval Workflow</TabsTrigger>;
}

export function TicketApprovalTabContent({ ticketId }: TicketApprovalTabProps) {
  const { data, isLoading } = useTicketApprovalState(ticketId);
  const approve = useApproveTicketStep(ticketId);
  const reject = useRejectTicketStep(ticketId);

  if (!isApprovalEngineEnabled) return null;

  return (
    <TabsContent value="approval-workflow" className="enterprise-panel space-y-8">
      {isLoading ? (
        <DataTableSkeleton />
      ) : (
        <>
          <section className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold">Approval status</h3>
              {data?.active?.status && (
                <Badge variant="secondary">{data.active.status}</Badge>
              )}
              {!data?.active && data?.latest?.status && (
                <Badge variant="outline">{data.latest.status} (completed)</Badge>
              )}
            </div>
            {!data?.active && !data?.latest && (
              <p className="text-sm text-muted-foreground">
                No approval workflow has been started for this ticket.
              </p>
            )}
          </section>

          {data?.steps && (
            <section className="space-y-3">
              <h3 className="text-sm font-semibold">Workflow steps</h3>
              <ApprovalWorkflowView
                steps={data.steps}
                currentStepId={data.active?.current_step_id}
              />
            </section>
          )}

          {data?.can_act && data.active?.status === 'PENDING' && (
            <section className="space-y-3">
              <h3 className="text-sm font-semibold">Your decision</h3>
              <form
                className="space-y-3 max-w-lg"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const comments = String(fd.get('comments') || '').trim() || undefined;
                  approve.mutate({ comments });
                }}
              >
                <textarea
                  name="comments"
                  className="w-full min-h-[80px] rounded-md border px-3 py-2 text-sm"
                  placeholder="Optional comments…"
                />
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="text-sm font-medium text-primary"
                    disabled={approve.isPending || reject.isPending}
                  >
                    {approve.isPending ? 'Approving…' : 'Approve'}
                  </button>
                  <button
                    type="button"
                    className="text-sm font-medium text-destructive"
                    disabled={approve.isPending || reject.isPending}
                    onClick={() => {
                      const comments = prompt('Rejection reason (optional):') || undefined;
                      reject.mutate({ comments });
                    }}
                  >
                    {reject.isPending ? 'Rejecting…' : 'Reject'}
                  </button>
                </div>
              </form>
            </section>
          )}

          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Audit trail</h3>
            <ApprovalHistoryPanel history={data?.history ?? []} />
          </section>
        </>
      )}
    </TabsContent>
  );
}
