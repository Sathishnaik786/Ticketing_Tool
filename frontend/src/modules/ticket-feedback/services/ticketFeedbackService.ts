import { toast } from 'sonner';
import { apiCall } from '@/services/api';
import { isTicketFeedbackEnabled } from '@/config/features';

export interface TicketFeedback {
  id: string;
  ticket_id: string;
  submitted_by: string;
  rating: number;
  resolution_quality: number;
  communication_quality: number;
  response_time: number;
  comments?: string | null;
  submitted_at: string;
  created_at: string;
  updated_at: string;
}

export interface SubmitTicketFeedbackPayload {
  ticket_id: string;
  rating: number;
  resolution_quality: number;
  communication_quality: number;
  response_time: number;
  comments?: string | null;
}

export interface FeedbackMetrics {
  averageRating: number;
  averageCommunicationScore: number;
  averageResolutionScore: number;
  averageResponseScore: number;
  totalFeedback: number;
  csatPercentage: number;
  departmentWiseRating: Array<{ name: string; averageRating: number; count: number }>;
  categoryWiseRating: Array<{ name: string; averageRating: number; count: number }>;
  monthlyTrend: Array<{ month: string; averageRating: number; count: number; csatPercentage: number }>;
  topRatedCategories: Array<{ name: string; averageRating: number; count: number }>;
  lowestRatedCategories: Array<{ name: string; averageRating: number; count: number }>;
}

function handleFeedbackError(error: unknown): never {
  const err = error as Error & { status?: number };
  const status = err.status;

  const messageByStatus: Record<number, string> = {
    401: 'Session expired. Please sign in again.',
    403: 'You do not have permission for this action.',
    404: 'Feedback not found.',
    409: 'Feedback already submitted for this ticket.',
    422: err.message || 'Invalid request data.',
    503: 'Ticket feedback module currently disabled.',
  };

  toast.error(messageByStatus[status ?? 0] || err.message || 'Something went wrong');
  throw err;
}

async function feedbackCall<T>(url: string, method: string, body?: unknown): Promise<T> {
  if (!isTicketFeedbackEnabled) {
    const error = new Error('Ticket feedback module currently disabled.') as Error & { status?: number };
    error.status = 503;
    handleFeedbackError(error);
  }

  try {
    const response = await apiCall(url, method, body);
    return response as T;
  } catch (error) {
    handleFeedbackError(error);
  }
}

export const ticketFeedbackApi = {
  submitFeedback: async (payload: SubmitTicketFeedbackPayload) => {
    return feedbackCall<{ success: boolean; data: TicketFeedback }>(
      '/ticket-feedback',
      'POST',
      payload
    );
  },

  getFeedbackByTicket: async (ticketId: string) => {
    return feedbackCall<{ success: boolean; data: TicketFeedback }>(
      `/ticket-feedback/ticket/${ticketId}`,
      'GET'
    );
  },

  getMetrics: async (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    const suffix = query ? `?${query}` : '';
    return feedbackCall<{ success: boolean; data: FeedbackMetrics }>(
      `/ticket-feedback/metrics${suffix}`,
      'GET'
    );
  },

  getMySubmissionCount: async () => {
    return feedbackCall<{ success: boolean; data: { count: number } }>(
      '/ticket-feedback/my-count',
      'GET'
    );
  },
};
