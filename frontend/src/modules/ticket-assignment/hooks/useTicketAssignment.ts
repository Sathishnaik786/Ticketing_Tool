import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { isTicketAssignmentsEnabled } from '@/config/features';
import { queryKeys } from '@/utils/queryKeys';
import { ticketAssignmentApi } from '../services/ticketAssignmentService';

const enabled = isTicketAssignmentsEnabled;

export function useMyQueue(params: Record<string, string | number | undefined> = {}) {
  return useQuery({
    queryKey: queryKeys.myAssignmentQueue(params),
    queryFn: () => ticketAssignmentApi.getMyQueue(params),
    enabled,
  });
}

export function useTeamQueue(params: Record<string, string | number | undefined> = {}) {
  return useQuery({
    queryKey: queryKeys.teamAssignmentQueue(params),
    queryFn: () => ticketAssignmentApi.getTeamQueue(params),
    enabled,
  });
}

export function useUnassignedQueue(params: Record<string, string | number | undefined> = {}) {
  return useQuery({
    queryKey: queryKeys.unassignedQueue(params),
    queryFn: () => ticketAssignmentApi.getUnassigned(params),
    enabled,
  });
}

export function useAssignmentAnalytics() {
  return useQuery({
    queryKey: queryKeys.assignmentAnalytics(),
    queryFn: () => ticketAssignmentApi.getAnalytics(),
    enabled,
  });
}

export function useTicketAssignmentHistory(ticketId: string) {
  return useQuery({
    queryKey: queryKeys.ticketAssignmentHistory(ticketId),
    queryFn: () => ticketAssignmentApi.getTicketHistory(ticketId),
    enabled: enabled && !!ticketId,
  });
}

export function useAssignTicketMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ticketAssignmentApi.assignTicket,
    onSuccess: () => {
      toast.success('Ticket assigned successfully');
      queryClient.invalidateQueries({ queryKey: ['assignmentQueue'] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

export function useReassignTicketMutation(ticketId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { assigned_to: string; assignment_type?: string; reason?: string }) =>
      ticketAssignmentApi.reassignTicket(ticketId, payload),
    onSuccess: () => {
      toast.success('Ticket reassigned successfully');
      queryClient.invalidateQueries({ queryKey: ['assignmentQueue'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.ticketAssignmentHistory(ticketId) });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}
