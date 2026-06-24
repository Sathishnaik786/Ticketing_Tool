import { toast } from 'sonner';
import { apiCall } from '@/services/api';
import { isTicketAssignmentsEnabled } from '@/config/features';

export interface QueueTicket {
  id: string;
  ticket_number: string;
  title: string;
  status: string;
  priority: string;
  department_id?: string;
  assignee_id?: string | null;
  requester_id?: string;
  created_at: string;
  updated_at: string;
}

export interface AssignmentHistoryEntry {
  id: string;
  ticket_id: string;
  old_assignee?: string | null;
  new_assignee?: string | null;
  changed_by: string;
  reason?: string | null;
  changed_at: string;
}

export interface AssignmentAnalytics {
  assignmentCount: number;
  ticketsPerAgent: Array<{ agentId: string; count: number }>;
  departmentWorkload: Array<{ departmentId: string; count: number }>;
  averageQueueSize: number;
  assignmentTrend: Array<{ month: string; count: number }>;
  totalAssigned: number;
  totalUnassigned: number;
  overloadedAgents: Array<{ agentId: string; count: number }>;
  queueDistribution: Array<{ agentId: string; count: number }>;
}

function handleError(error: unknown): never {
  const err = error as Error & { status?: number };
  const messages: Record<number, string> = {
    401: 'Session expired. Please sign in again.',
    403: 'You do not have permission for this action.',
    409: 'Ticket is already assigned.',
    503: 'Ticket assignment module currently disabled.',
  };
  toast.error(messages[err.status ?? 0] || err.message || 'Something went wrong');
  throw err;
}

async function assignmentCall<T>(url: string, method: string, body?: unknown): Promise<T> {
  if (!isTicketAssignmentsEnabled) {
    const error = new Error('Ticket assignment module currently disabled.') as Error & { status?: number };
    error.status = 503;
    handleError(error);
  }
  try {
    return (await apiCall(url, method, body)) as T;
  } catch (error) {
    handleError(error);
  }
}

function buildQuery(params: Record<string, string | number | undefined> = {}): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.append(key, String(value));
    }
  });
  const q = search.toString();
  return q ? `?${q}` : '';
}

export const ticketAssignmentApi = {
  assignTicket: (payload: {
    ticket_id: string;
    assigned_to: string;
    assignment_type?: string;
    reason?: string;
  }) => assignmentCall<{ success: boolean; data: unknown }>('/ticket-assignments', 'POST', payload),

  reassignTicket: (
    ticketId: string,
    payload: { assigned_to: string; assignment_type?: string; reason?: string }
  ) => assignmentCall<{ success: boolean; data: unknown }>(
    `/ticket-assignments/${ticketId}/reassign`,
    'PUT',
    payload
  ),

  getMyQueue: (params: Record<string, string | number | undefined> = {}) =>
    assignmentCall<{ success: boolean; data: QueueTicket[]; meta: { total: number } }>(
      `/ticket-assignments/my-queue${buildQuery(params)}`,
      'GET'
    ),

  getTeamQueue: (params: Record<string, string | number | undefined> = {}) =>
    assignmentCall<{ success: boolean; data: QueueTicket[]; meta: { total: number } }>(
      `/ticket-assignments/team-queue${buildQuery(params)}`,
      'GET'
    ),

  getUnassigned: (params: Record<string, string | number | undefined> = {}) =>
    assignmentCall<{ success: boolean; data: QueueTicket[]; meta: { total: number } }>(
      `/ticket-assignments/unassigned${buildQuery(params)}`,
      'GET'
    ),

  getAnalytics: () =>
    assignmentCall<{ success: boolean; data: AssignmentAnalytics }>(
      '/ticket-assignments/analytics',
      'GET'
    ),

  getTicketHistory: (ticketId: string) =>
    assignmentCall<{ success: boolean; data: AssignmentHistoryEntry[] }>(
      `/ticket-assignments/history/${ticketId}`,
      'GET'
    ),
};
