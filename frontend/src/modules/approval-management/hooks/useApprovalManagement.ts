import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { approvalManagementApi } from '../services/approvalManagementService';

export const approvalQueryKeys = {
  catalog: ['approval-catalog'] as const,
  myApprovals: ['approval-my'] as const,
  pending: ['approval-pending'] as const,
  analytics: ['approval-analytics'] as const,
  ticketState: (ticketId: string) => ['approval-ticket', ticketId] as const,
};

export function useServiceCatalog() {
  return useQuery({
    queryKey: approvalQueryKeys.catalog,
    queryFn: async () => {
      const res = await approvalManagementApi.getCatalog();
      return res.data;
    },
  });
}

export function useMyApprovals() {
  return useQuery({
    queryKey: approvalQueryKeys.myApprovals,
    queryFn: async () => {
      const res = await approvalManagementApi.getMyApprovals();
      return res.data;
    },
  });
}

export function usePendingApprovals() {
  return useQuery({
    queryKey: approvalQueryKeys.pending,
    queryFn: async () => {
      const res = await approvalManagementApi.getPending();
      return res.data;
    },
  });
}

export function useApprovalAnalytics() {
  return useQuery({
    queryKey: approvalQueryKeys.analytics,
    queryFn: async () => {
      const res = await approvalManagementApi.getAnalytics();
      return res.data;
    },
  });
}

export function useTicketApprovalState(ticketId: string) {
  return useQuery({
    queryKey: approvalQueryKeys.ticketState(ticketId),
    queryFn: async () => {
      const res = await approvalManagementApi.getTicketApprovalState(ticketId);
      return res.data;
    },
    enabled: Boolean(ticketId),
  });
}

export function useStartTicketApproval(ticketId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { workflow_id: string; comments?: string }) =>
      approvalManagementApi.startTicketApproval(ticketId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: approvalQueryKeys.ticketState(ticketId) });
      qc.invalidateQueries({ queryKey: approvalQueryKeys.myApprovals });
      qc.invalidateQueries({ queryKey: approvalQueryKeys.pending });
    },
  });
}

export function useApproveTicketStep(ticketId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload?: { comments?: string }) =>
      approvalManagementApi.approveTicket(ticketId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: approvalQueryKeys.ticketState(ticketId) });
      qc.invalidateQueries({ queryKey: approvalQueryKeys.pending });
      qc.invalidateQueries({ queryKey: approvalQueryKeys.analytics });
    },
  });
}

export function useRejectTicketStep(ticketId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload?: { comments?: string }) =>
      approvalManagementApi.rejectTicket(ticketId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: approvalQueryKeys.ticketState(ticketId) });
      qc.invalidateQueries({ queryKey: approvalQueryKeys.pending });
      qc.invalidateQueries({ queryKey: approvalQueryKeys.analytics });
    },
  });
}
