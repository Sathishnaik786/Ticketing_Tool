import { toast } from 'sonner';
import { apiCall } from '@/services/api';
import { isCommunicationTrackingEnabled } from '@/config/features';

export type CommunicationType = 'COMMENT' | 'CHAT' | 'EMAIL' | 'PHONE_CALL' | 'MEETING' | 'SYSTEM_NOTE';
export type CommunicationDirection = 'INBOUND' | 'OUTBOUND' | 'INTERNAL';
export type CommunicationVisibility = 'PUBLIC' | 'INTERNAL';
export type CallOutcome = 'NO_ANSWER' | 'CONNECTED' | 'RESOLVED' | 'FOLLOWUP_REQUIRED';
export type EmailStatus = 'SENT' | 'FAILED' | 'RECEIVED';

export interface TicketCommunication {
  id: string;
  ticket_id: string;
  communication_type: CommunicationType;
  direction: CommunicationDirection;
  subject?: string | null;
  message: string;
  created_by: string;
  visibility: CommunicationVisibility;
  created_at: string;
  updated_at: string;
  author?: { id: string; first_name?: string; last_name?: string; email?: string };
}

export interface TicketCallLog {
  id: string;
  ticket_id: string;
  employee_id: string;
  customer_name?: string | null;
  phone_number?: string | null;
  call_start_at: string;
  call_end_at?: string | null;
  duration_seconds?: number | null;
  call_summary?: string | null;
  outcome: CallOutcome;
  created_at: string;
}

export interface TicketEmailLog {
  id: string;
  ticket_id: string;
  sender: string;
  recipient: string;
  cc?: string | null;
  subject: string;
  body: string;
  status: EmailStatus;
  created_at: string;
}

export interface TimelineEvent {
  id: string;
  ticket_id: string;
  event_type: string;
  event_data: Record<string, unknown>;
  created_by?: string | null;
  created_at: string;
  integrated?: boolean;
}

export interface CommunicationAnalytics {
  totalCommunications: number;
  callsLogged: number;
  emailsSent: number;
  commentsAdded: number;
  averageResponseTimeMinutes: number;
  communicationByDepartment: Array<{ name: string; count: number }>;
  communicationByBusinessUnit: Array<{ name: string; count: number }>;
  recentCommunications: TicketCommunication[];
}

function handleError(error: unknown): never {
  const err = error as Error & { status?: number };
  const status = err.status;
  const messageByStatus: Record<number, string> = {
    401: 'Session expired. Please sign in again.',
    403: 'You do not have permission for this action.',
    404: 'Communication record not found.',
    422: err.message || 'Invalid request data.',
    503: 'Communication tracking module currently disabled.',
  };
  toast.error(messageByStatus[status ?? 0] || err.message || 'Something went wrong');
  throw err;
}

async function commCall<T>(url: string, method: string, body?: unknown): Promise<T> {
  if (!isCommunicationTrackingEnabled) {
    const error = new Error('Communication tracking module currently disabled.') as Error & { status?: number };
    error.status = 503;
    handleError(error);
  }
  try {
    return (await apiCall(url, method, body)) as T;
  } catch (error) {
    handleError(error);
  }
}

export const communicationTrackingApi = {
  addComment: (payload: { ticket_id: string; message: string; visibility?: CommunicationVisibility; subject?: string }) =>
    commCall<{ success: boolean; data: unknown }>('/communications/comment', 'POST', payload),

  addChat: (payload: { ticket_id: string; message: string; direction?: CommunicationDirection }) =>
    commCall<{ success: boolean; data: unknown }>('/communications/chat', 'POST', payload),

  logEmail: (payload: {
    ticket_id: string;
    sender: string;
    recipient: string;
    cc?: string;
    subject: string;
    body: string;
    status?: EmailStatus;
  }) => commCall<{ success: boolean; data: unknown }>('/communications/email', 'POST', payload),

  logCall: (payload: {
    ticket_id: string;
    customer_name?: string;
    phone_number?: string;
    call_start_at: string;
    call_end_at?: string;
    duration_seconds?: number;
    call_summary?: string;
    outcome?: CallOutcome;
  }) => commCall<{ success: boolean; data: unknown }>('/communications/call-log', 'POST', payload),

  addInternalNote: (payload: { ticket_id: string; message: string; subject?: string }) =>
    commCall<{ success: boolean; data: unknown }>('/communications/internal-note', 'POST', payload),

  getByTicket: (ticketId: string) =>
    commCall<{
      success: boolean;
      data: {
        ticket_id: string;
        communications: TicketCommunication[];
        call_logs: TicketCallLog[];
        email_logs: TicketEmailLog[];
      };
    }>(`/communications/ticket/${ticketId}`, 'GET'),

  getTimeline: (ticketId: string) =>
    commCall<{ success: boolean; data: { ticket_id: string; events: TimelineEvent[] } }>(
      `/communications/timeline/${ticketId}`,
      'GET'
    ),

  getAnalytics: (params?: { from?: string; to?: string }) => {
    const qs = new URLSearchParams();
    if (params?.from) qs.set('from', params.from);
    if (params?.to) qs.set('to', params.to);
    const query = qs.toString();
    return commCall<{ success: boolean; data: CommunicationAnalytics }>(
      `/communications/analytics${query ? `?${query}` : ''}`,
      'GET'
    );
  },

  getDashboardSummary: () =>
    commCall<{ success: boolean; data: { recentCommunications: TicketCommunication[]; role: string } }>(
      '/communications/dashboard-summary',
      'GET'
    ),
};
