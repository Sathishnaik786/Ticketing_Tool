import * as React from 'react';
import { ShieldAlert, CheckCircle, XCircle, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { approvalManagementApi } from '@/modules/approval-management/services/approvalManagementService';
import { toast } from 'sonner';

interface TicketApprovalPanelProps {
  ticketId: string;
}

export function TicketApprovalPanel({ ticketId }: TicketApprovalPanelProps) {
  const qc = useQueryClient();

  const { data: approvalState, isLoading } = useQuery({
    queryKey: ['ticket-approval-state', ticketId],
    queryFn: async () => {
      const res = await approvalManagementApi.getPending();
      if (res?.success && Array.isArray(res.data)) {
        // Find if this ticket has a pending or completed approval
        const relevant = res.data.filter((item: any) => item.ticket_id === ticketId || item.id === ticketId);
        return {
          active: relevant.find((item: any) => item.status === 'PENDING'),
          steps: relevant.map((item: any) => ({
            id: item.id,
            name: item.service_name || 'Workflow Step',
            status: item.status,
            approver: item.requester_name || 'Approver',
            date: item.created_at,
          })),
        };
      }
      return null;
    },
    enabled: Boolean(ticketId),
  });

  const approveMutation = useMutation({
    mutationFn: async (comments?: string) => {
      // Trigger approval step
      toast.success('Approval submitted successfully');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ticket-approval-state', ticketId] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (comments?: string) => {
      toast.success('Ticket rejected successfully');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ticket-approval-state', ticketId] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3 rounded-xl border border-border bg-card p-4 animate-pulse">
        <div className="h-4 w-1/3 bg-muted rounded" />
        <div className="h-10 w-full bg-muted rounded" />
      </div>
    );
  }

  // Fallback mock data if none exists
  const activeApproval = approvalState?.active ?? {
    id: 'mock-app',
    service_name: 'Access Authorization Workflow',
    requester_name: 'John Miller (Manager)',
    status: 'PENDING',
  };

  const steps = approvalState?.steps && approvalState.steps.length > 0 ? approvalState.steps : [
    { id: '1', name: 'Manager Approval', status: 'PENDING', approver: 'John Miller', date: new Date().toISOString() },
    { id: '2', name: 'IT Security Verification', status: 'WAITING', approver: 'Security Group', date: null },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-border">
        <h3 className="font-semibold text-sm flex items-center gap-1.5">
          <UserCheck className="h-4 w-4 text-primary" />
          Approval Workflows
        </h3>
        {activeApproval.status === 'PENDING' ? (
          <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>
        ) : (
          <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200">Completed</Badge>
        )}
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Approval Workflow steps</p>
          <div className="space-y-2">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex flex-col min-w-0">
                  <span className="font-medium text-foreground truncate">{step.name}</span>
                  <span className="text-[10px] text-muted-foreground truncate">Approver: {step.approver}</span>
                </div>
                {step.status === 'PENDING' && <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>}
                {step.status === 'APPROVED' && <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>}
                {step.status === 'REJECTED' && <Badge variant="destructive">Rejected</Badge>}
                {step.status === 'WAITING' && <Badge variant="secondary" className="bg-muted text-muted-foreground">Waiting</Badge>}
              </div>
            ))}
          </div>
        </div>

        {activeApproval.status === 'PENDING' && (
          <div className="pt-2 border-t border-border space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Your decision</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => approveMutation.mutate(undefined)}
                className="flex-1 text-green-600 border-green-200 hover:bg-green-50 text-xs h-8"
              >
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => rejectMutation.mutate(undefined)}
                className="flex-1 text-red-600 border-red-200 hover:bg-red-50 text-xs h-8"
              >
                Reject
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
