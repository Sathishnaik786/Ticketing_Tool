import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isCommunicationTrackingEnabled } from '@/config/features';
import { communicationTrackingApi } from '../services/communicationTrackingService';

export const communicationQueryKeys = {
  all: ['communication-tracking'] as const,
  ticket: (ticketId: string) => [...communicationQueryKeys.all, 'ticket', ticketId] as const,
  timeline: (ticketId: string) => [...communicationQueryKeys.all, 'timeline', ticketId] as const,
  analytics: (from?: string, to?: string) => [...communicationQueryKeys.all, 'analytics', from, to] as const,
  dashboard: () => [...communicationQueryKeys.all, 'dashboard'] as const,
};

export function useTicketCommunications(ticketId: string) {
  return useQuery({
    queryKey: communicationQueryKeys.ticket(ticketId),
    queryFn: () => communicationTrackingApi.getByTicket(ticketId),
    enabled: isCommunicationTrackingEnabled && Boolean(ticketId),
  });
}

export function useTicketActivityTimeline(ticketId: string) {
  return useQuery({
    queryKey: communicationQueryKeys.timeline(ticketId),
    queryFn: () => communicationTrackingApi.getTimeline(ticketId),
    enabled: isCommunicationTrackingEnabled && Boolean(ticketId),
  });
}

export function useCommunicationAnalytics(from?: string, to?: string) {
  return useQuery({
    queryKey: communicationQueryKeys.analytics(from, to),
    queryFn: () => communicationTrackingApi.getAnalytics({ from, to }),
    enabled: isCommunicationTrackingEnabled,
  });
}

export function useCommunicationDashboardSummary() {
  return useQuery({
    queryKey: communicationQueryKeys.dashboard(),
    queryFn: () => communicationTrackingApi.getDashboardSummary(),
    enabled: isCommunicationTrackingEnabled,
  });
}

export function useAddCommunicationComment(ticketId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: communicationTrackingApi.addComment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: communicationQueryKeys.ticket(ticketId) });
      qc.invalidateQueries({ queryKey: communicationQueryKeys.timeline(ticketId) });
    },
  });
}

export function useLogCommunicationCall(ticketId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: communicationTrackingApi.logCall,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: communicationQueryKeys.ticket(ticketId) });
      qc.invalidateQueries({ queryKey: communicationQueryKeys.timeline(ticketId) });
    },
  });
}

export function useLogCommunicationEmail(ticketId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: communicationTrackingApi.logEmail,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: communicationQueryKeys.ticket(ticketId) });
      qc.invalidateQueries({ queryKey: communicationQueryKeys.timeline(ticketId) });
    },
  });
}

export function useAddInternalNote(ticketId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: communicationTrackingApi.addInternalNote,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: communicationQueryKeys.ticket(ticketId) });
      qc.invalidateQueries({ queryKey: communicationQueryKeys.timeline(ticketId) });
    },
  });
}
