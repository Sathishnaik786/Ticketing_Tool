import { toast } from 'sonner';
import { apiCall } from '@/services/api';
import { isTicketingEnabled } from '@/config/features';
import type {
  AssignTicketPayload,
  ChangeStatusPayload,
  CreateTicketPayload,
  SignedUrlResponse,
  Ticket,
  TicketAssignment,
  TicketAttachment,
  TicketComment,
  TicketFilters,
  TicketListResponse,
  TicketSla,
  TicketTimelineEntry,
  TicketWatcher,
  UpdateTicketPayload,
  TicketCategory,
} from '../types/ticketing.types';

function handleTicketingError(error: unknown): never {
  const err = error as Error & { status?: number };
  const status = err.status;

  const messageByStatus: Record<number, string> = {
    401: 'Session expired. Please sign in again.',
    403: 'You do not have permission for this action.',
    404: 'Ticket not found.',
    422: err.message || 'Invalid request data.',
    503: 'Ticketing module currently disabled.',
  };

  toast.error(messageByStatus[status ?? 0] || err.message || 'Something went wrong');
  throw err;
}

async function ticketingCall<T>(
  url: string,
  method: string,
  body?: unknown
): Promise<T> {
  if (!isTicketingEnabled) {
    const error = new Error('Ticketing module currently disabled.') as Error & { status?: number };
    error.status = 503;
    handleTicketingError(error);
  }

  try {
    const response = await apiCall(url, method, body);
    return response as T;
  } catch (error) {
    handleTicketingError(error);
  }
}

function buildQueryString(filters: TicketFilters = {}): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  const query = params.toString();
  return query ? `?${query}` : '';
}

export const ticketingApi = {
  listTickets: async (filters: TicketFilters = {}): Promise<TicketListResponse> => {
    return ticketingCall<TicketListResponse>(`/tickets${buildQueryString(filters)}`, 'GET');
  },

  createTicket: async (payload: CreateTicketPayload): Promise<{ success: boolean; data: Ticket }> => {
    return ticketingCall(`/tickets`, 'POST', payload);
  },

  getTicket: async (ticketId: string): Promise<{ success: boolean; data: Ticket }> => {
    return ticketingCall(`/tickets/${ticketId}`, 'GET');
  },

  updateTicket: async (
    ticketId: string,
    payload: UpdateTicketPayload
  ): Promise<{ success: boolean; data: Ticket }> => {
    return ticketingCall(`/tickets/${ticketId}`, 'PATCH', payload);
  },

  changeStatus: async (
    ticketId: string,
    payload: ChangeStatusPayload
  ): Promise<{ success: boolean; data: Ticket }> => {
    return ticketingCall(`/tickets/${ticketId}/status`, 'PATCH', payload);
  },

  closeTicket: async (
    ticketId: string,
    resolutionNotes?: string
  ): Promise<{ success: boolean; data: Ticket }> => {
    return ticketingCall(`/tickets/${ticketId}/close`, 'PATCH', {
      resolution_notes: resolutionNotes ?? null,
    });
  },

  reopenTicket: async (ticketId: string): Promise<{ success: boolean; data: Ticket }> => {
    return ticketingCall(`/tickets/${ticketId}/reopen`, 'PATCH');
  },

  listComments: async (
    ticketId: string,
    includeInternal = false
  ): Promise<{ success: boolean; data: TicketComment[] }> => {
    const query = includeInternal ? '?includeInternal=true' : '';
    return ticketingCall(`/tickets/${ticketId}/comments${query}`, 'GET');
  },

  createComment: async (
    ticketId: string,
    payload: { content: string; is_internal?: boolean }
  ): Promise<{ success: boolean; data: TicketComment }> => {
    return ticketingCall(`/tickets/${ticketId}/comments`, 'POST', payload);
  },

  listAttachments: async (
    ticketId: string
  ): Promise<{ success: boolean; data: TicketAttachment[] }> => {
    return ticketingCall(`/tickets/${ticketId}/attachments`, 'GET');
  },

  uploadAttachment: async (
    ticketId: string,
    file: File
  ): Promise<{ success: boolean; data: TicketAttachment }> => {
    const formData = new FormData();
    formData.append('file', file);
    return ticketingCall(`/tickets/${ticketId}/attachments`, 'POST', formData);
  },

  getAttachmentUrl: async (
    ticketId: string,
    attachmentId: string,
    expiresIn = 3600
  ): Promise<{ success: boolean; data: SignedUrlResponse }> => {
    return ticketingCall(
      `/tickets/${ticketId}/attachments/${attachmentId}/url?expiresIn=${expiresIn}`,
      'GET'
    );
  },

  listTimeline: async (
    ticketId: string
  ): Promise<{ success: boolean; data: TicketTimelineEntry[] }> => {
    return ticketingCall(`/tickets/${ticketId}/timeline`, 'GET');
  },

  getSla: async (ticketId: string): Promise<{ success: boolean; data: TicketSla }> => {
    return ticketingCall(`/tickets/${ticketId}/sla`, 'GET');
  },

  assignTicket: async (
    ticketId: string,
    payload: AssignTicketPayload
  ): Promise<{ success: boolean; data: unknown }> => {
    return ticketingCall(`/tickets/${ticketId}/assign`, 'POST', payload);
  },

  reassignTicket: async (
    ticketId: string,
    payload: AssignTicketPayload
  ): Promise<{ success: boolean; data: unknown }> => {
    return ticketingCall(`/tickets/${ticketId}/reassign`, 'POST', payload);
  },

  listAssignments: async (
    ticketId: string
  ): Promise<{ success: boolean; data: TicketAssignment[] }> => {
    return ticketingCall(`/tickets/${ticketId}/assignments`, 'GET');
  },

  listWatchers: async (
    ticketId: string
  ): Promise<{ success: boolean; data: TicketWatcher[] }> => {
    return ticketingCall(`/tickets/${ticketId}/watchers`, 'GET');
  },

  addWatcher: async (
    ticketId: string,
    employeeId: string
  ): Promise<{ success: boolean; data: TicketWatcher }> => {
    return ticketingCall(`/tickets/${ticketId}/watchers`, 'POST', { employee_id: employeeId });
  },

  removeWatcher: async (ticketId: string, employeeId: string): Promise<void> => {
    await ticketingCall(`/tickets/${ticketId}/watchers/${employeeId}`, 'DELETE');
  },

  listCategories: async (): Promise<{ success: boolean; data: TicketCategory[] }> => {
    return ticketingCall('/ticket-categories', 'GET');
  },
};

export { handleTicketingError };
