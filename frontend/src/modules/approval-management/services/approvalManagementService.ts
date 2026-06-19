import { toast } from 'sonner';
import { apiCall } from '@/services/api';
import { isApprovalEngineEnabled } from '@/config/features';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'ESCALATED';
export type ApprovalType = 'SINGLE' | 'MULTI';
export type CatalogCategory = 'IT' | 'HR' | 'FINANCE' | 'PROCUREMENT' | 'FACILITY' | 'ADMINISTRATION';

export interface ServiceCatalogItem {
  id: string;
  catalog_id: string;
  name: string;
  description?: string | null;
  requires_approval: boolean;
  is_active: boolean;
  display_order: number;
}

export interface ServiceCatalog {
  id: string;
  name: string;
  description?: string | null;
  category: CatalogCategory;
  display_order: number;
  is_active: boolean;
  items: ServiceCatalogItem[];
}

export interface ApprovalWorkflowStep {
  id: string;
  workflow_id: string;
  step_order: number;
  step_name: string;
  approver_role: string;
  approver_employee_id?: string | null;
  escalation_hours?: number | null;
  is_required: boolean;
}

export interface ApprovalWorkflow {
  id: string;
  name: string;
  description?: string | null;
  service_item_id?: string | null;
  approval_type: ApprovalType;
  is_active: boolean;
  created_by?: string | null;
  department_id?: string | null;
}

export interface TicketApproval {
  id: string;
  ticket_id: string;
  workflow_id: string;
  current_step_id?: string | null;
  status: ApprovalStatus;
  started_by: string;
  started_at: string;
  completed_at?: string | null;
  created_at: string;
  current_step?: ApprovalWorkflowStep;
}

export interface ApprovalHistoryEntry {
  id: string;
  ticket_approval_id: string;
  ticket_id: string;
  step_id?: string | null;
  action: string;
  actor_id?: string | null;
  actor_role?: string | null;
  comments?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface TicketApprovalState {
  active: TicketApproval | null;
  latest?: TicketApproval | null;
  workflow?: ApprovalWorkflow;
  steps?: ApprovalWorkflowStep[];
  current_step?: ApprovalWorkflowStep;
  history: ApprovalHistoryEntry[];
  can_act?: boolean;
}

export interface ApprovalAnalytics {
  statusCounts: Record<string, number>;
  pendingCount: number;
  totalApprovals: number;
}

function handleError(error: unknown): never {
  const err = error as Error & { status?: number };
  const status = err.status;
  const messageByStatus: Record<number, string> = {
    401: 'Session expired. Please sign in again.',
    403: 'You do not have permission for this action.',
    404: 'Approval record not found.',
    409: 'An approval workflow is already active for this ticket.',
    422: err.message || 'Invalid request data.',
    503: 'Approval engine module currently disabled.',
  };
  toast.error(messageByStatus[status ?? 0] || err.message || 'Something went wrong');
  throw err;
}

async function approvalCall<T>(url: string, method: string, body?: unknown): Promise<T> {
  if (!isApprovalEngineEnabled) {
    const error = new Error('Approval engine module currently disabled.') as Error & { status?: number };
    error.status = 503;
    handleError(error);
  }
  try {
    return (await apiCall(url, method, body)) as T;
  } catch (error) {
    handleError(error);
  }
}

export const approvalManagementApi = {
  getCatalog: () =>
    approvalCall<{ success: boolean; data: ServiceCatalog[] }>('/approvals/catalog', 'GET'),

  createWorkflow: (payload: {
    name: string;
    description?: string;
    service_item_id?: string;
    approval_type?: ApprovalType;
    is_active?: boolean;
    department_id?: string;
    steps: Array<{
      step_order: number;
      step_name: string;
      approver_role: string;
      approver_employee_id?: string;
      escalation_hours?: number;
      is_required?: boolean;
    }>;
  }) => approvalCall<{ success: boolean; data: unknown }>('/approvals/workflow', 'POST', payload),

  updateWorkflow: (id: string, payload: Record<string, unknown>) =>
    approvalCall<{ success: boolean; data: unknown }>(`/approvals/workflow/${id}`, 'PUT', payload),

  getWorkflow: (id: string) =>
    approvalCall<{ success: boolean; data: { workflow: ApprovalWorkflow; steps: ApprovalWorkflowStep[] } }>(
      `/approvals/workflow/${id}`,
      'GET'
    ),

  startTicketApproval: (ticketId: string, payload: { workflow_id: string; comments?: string }) =>
    approvalCall<{ success: boolean; data: unknown }>(`/approvals/ticket/${ticketId}/start`, 'POST', payload),

  approveTicket: (ticketId: string, payload?: { comments?: string }) =>
    approvalCall<{ success: boolean; data: unknown }>(`/approvals/ticket/${ticketId}/approve`, 'POST', payload ?? {}),

  rejectTicket: (ticketId: string, payload?: { comments?: string }) =>
    approvalCall<{ success: boolean; data: unknown }>(`/approvals/ticket/${ticketId}/reject`, 'POST', payload ?? {}),

  getTicketApprovalState: (ticketId: string) =>
    approvalCall<{ success: boolean; data: TicketApprovalState }>(`/approvals/ticket/${ticketId}/state`, 'GET'),

  getMyApprovals: () =>
    approvalCall<{ success: boolean; data: TicketApproval[] }>('/approvals/my-approvals', 'GET'),

  getPending: () =>
    approvalCall<{ success: boolean; data: TicketApproval[] }>('/approvals/pending', 'GET'),

  getAnalytics: () =>
    approvalCall<{ success: boolean; data: ApprovalAnalytics }>('/approvals/analytics', 'GET'),
};
