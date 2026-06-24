import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { isTicketFeedbackEnabled } from '@/config/features';
import { queryKeys } from '@/utils/queryKeys';
import {
  ticketFeedbackApi,
  type SubmitTicketFeedbackPayload,
} from '../services/ticketFeedbackService';

const enabledWhenFlagOn = isTicketFeedbackEnabled;

export function useTicketFeedback(ticketId: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.ticketFeedback(ticketId),
    queryFn: () => ticketFeedbackApi.getFeedbackByTicket(ticketId),
    enabled: enabledWhenFlagOn && !!ticketId && (options.enabled ?? true),
    retry: (failureCount, error) => {
      const status = (error as Error & { status?: number })?.status;
      if (status === 404) return false;
      return failureCount < 1;
    },
  });
}

export function useSubmitTicketFeedback(ticketId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<SubmitTicketFeedbackPayload, 'ticket_id'>) =>
      ticketFeedbackApi.submitFeedback({ ...payload, ticket_id: ticketId }),
    onSuccess: () => {
      toast.success('Thank you for your feedback');
      queryClient.invalidateQueries({ queryKey: queryKeys.ticketFeedback(ticketId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.feedbackMetrics() });
      queryClient.invalidateQueries({ queryKey: queryKeys.myFeedbackCount() });
    },
  });
}

export function useFeedbackMetrics(params: Record<string, string> = {}) {
  return useQuery({
    queryKey: queryKeys.feedbackMetrics(params),
    queryFn: () => ticketFeedbackApi.getMetrics(params),
    enabled: enabledWhenFlagOn,
  });
}

export function useMyFeedbackCount() {
  return useQuery({
    queryKey: queryKeys.myFeedbackCount(),
    queryFn: () => ticketFeedbackApi.getMySubmissionCount(),
    enabled: enabledWhenFlagOn,
  });
}
