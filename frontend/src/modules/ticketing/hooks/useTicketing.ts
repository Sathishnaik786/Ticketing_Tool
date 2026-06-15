import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { isTicketingEnabled } from '@/config/features';
import { queryKeys } from '@/utils/queryKeys';
import { ticketingApi } from '../services/ticketingService';
import type {
  AssignTicketPayload,
  ChangeStatusPayload,
  CreateTicketPayload,
  TicketFilters,
  UpdateTicketPayload,
} from '../types/ticketing.types';

const enabledWhenFlagOn = isTicketingEnabled;

export const useTickets = (filters: TicketFilters = {}) => {
  return useQuery({
    queryKey: queryKeys.tickets(filters),
    queryFn: async () => {
      const response = await ticketingApi.listTickets(filters);
      return response;
    },
    enabled: enabledWhenFlagOn,
  });
};

export const useTicket = (ticketId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.ticket(ticketId ?? ''),
    queryFn: async () => {
      const response = await ticketingApi.getTicket(ticketId!);
      return response.data;
    },
    enabled: enabledWhenFlagOn && !!ticketId,
  });
};

export const useCreateTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTicketPayload) => ticketingApi.createTicket(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Ticket created successfully');
    },
  });
};

export const useUpdateTicket = (ticketId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateTicketPayload) => ticketingApi.updateTicket(ticketId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ticket(ticketId) });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Ticket updated successfully');
    },
  });
};

export const useChangeStatus = (ticketId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ChangeStatusPayload) => ticketingApi.changeStatus(ticketId, payload),
    onSuccess: () => {
      invalidateTicketDetail(queryClient, ticketId);
      toast.success('Status updated successfully');
    },
  });
};

export const useCloseTicket = (ticketId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (resolutionNotes?: string) => ticketingApi.closeTicket(ticketId, resolutionNotes),
    onSuccess: () => {
      invalidateTicketDetail(queryClient, ticketId);
      toast.success('Ticket closed successfully');
    },
  });
};

export const useReopenTicket = (ticketId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => ticketingApi.reopenTicket(ticketId),
    onSuccess: () => {
      invalidateTicketDetail(queryClient, ticketId);
      toast.success('Ticket reopened successfully');
    },
  });
};

export const useComments = (ticketId: string, includeInternal = false) => {
  return useQuery({
    queryKey: queryKeys.ticketComments(ticketId, includeInternal),
    queryFn: async () => {
      const response = await ticketingApi.listComments(ticketId, includeInternal);
      return response.data;
    },
    enabled: enabledWhenFlagOn && !!ticketId,
  });
};

export const useCreateComment = (ticketId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { content: string; is_internal?: boolean }) =>
      ticketingApi.createComment(ticketId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticketComments', ticketId] });
      queryClient.invalidateQueries({ queryKey: queryKeys.ticketTimeline(ticketId) });
      toast.success('Comment added');
    },
  });
};

export const useAttachments = (ticketId: string) => {
  return useQuery({
    queryKey: queryKeys.ticketAttachments(ticketId),
    queryFn: async () => {
      const response = await ticketingApi.listAttachments(ticketId);
      return response.data;
    },
    enabled: enabledWhenFlagOn && !!ticketId,
  });
};

export const useUploadAttachment = (ticketId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => ticketingApi.uploadAttachment(ticketId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ticketAttachments(ticketId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.ticketTimeline(ticketId) });
      toast.success('Attachment uploaded');
    },
  });
};

export const useTimeline = (ticketId: string) => {
  return useQuery({
    queryKey: queryKeys.ticketTimeline(ticketId),
    queryFn: async () => {
      const response = await ticketingApi.listTimeline(ticketId);
      return response.data;
    },
    enabled: enabledWhenFlagOn && !!ticketId,
  });
};

export const useSla = (ticketId: string) => {
  return useQuery({
    queryKey: queryKeys.ticketSla(ticketId),
    queryFn: async () => {
      const response = await ticketingApi.getSla(ticketId);
      return response.data;
    },
    enabled: enabledWhenFlagOn && !!ticketId,
  });
};

export const useAssignTicket = (ticketId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AssignTicketPayload) => ticketingApi.assignTicket(ticketId, payload),
    onSuccess: () => {
      invalidateTicketDetail(queryClient, ticketId);
      toast.success('Ticket assigned');
    },
  });
};

export const useReassignTicket = (ticketId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AssignTicketPayload) => ticketingApi.reassignTicket(ticketId, payload),
    onSuccess: () => {
      invalidateTicketDetail(queryClient, ticketId);
      toast.success('Ticket reassigned');
    },
  });
};

export const useTicketAssignments = (ticketId: string) => {
  return useQuery({
    queryKey: ['ticketAssignments', ticketId],
    queryFn: async () => {
      const response = await ticketingApi.listAssignments(ticketId);
      return response.data;
    },
    enabled: enabledWhenFlagOn && !!ticketId,
  });
};

export const useWatchers = (ticketId: string) => {
  return useQuery({
    queryKey: queryKeys.ticketWatchers(ticketId),
    queryFn: async () => {
      const response = await ticketingApi.listWatchers(ticketId);
      return response.data;
    },
    enabled: enabledWhenFlagOn && !!ticketId,
  });
};

export const useAddWatcher = (ticketId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (employeeId: string) => ticketingApi.addWatcher(ticketId, employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ticketWatchers(ticketId) });
      toast.success('Watcher added');
    },
  });
};

export const useRemoveWatcher = (ticketId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (employeeId: string) => ticketingApi.removeWatcher(ticketId, employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ticketWatchers(ticketId) });
      toast.success('Watcher removed');
    },
  });
};

export const useTicketCategories = () => {
  return useQuery({
    queryKey: queryKeys.ticketCategories,
    queryFn: async () => {
      const response = await ticketingApi.listCategories();
      return response.data;
    },
    enabled: enabledWhenFlagOn,
  });
};

function invalidateTicketDetail(
  queryClient: ReturnType<typeof useQueryClient>,
  ticketId: string
) {
  queryClient.invalidateQueries({ queryKey: queryKeys.ticket(ticketId) });
  queryClient.invalidateQueries({ queryKey: ['tickets'] });
  queryClient.invalidateQueries({ queryKey: queryKeys.ticketTimeline(ticketId) });
  queryClient.invalidateQueries({ queryKey: queryKeys.ticketSla(ticketId) });
  queryClient.invalidateQueries({ queryKey: ['ticketAssignments', ticketId] });
}
