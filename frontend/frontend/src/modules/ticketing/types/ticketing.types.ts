export type TicketStatus =
  | 'OPEN'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'PENDING'
  | 'PENDING_USER'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REOPENED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'ESCALATED';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type TicketCategoryCode =
  | 'GENERAL'
  | 'IT'
  | 'FACILITIES'
  | 'HR'
  | 'PAYROLL'
  | 'OTHER';

export interface TicketCategory {
  id: string;
  name: string;
  description?: string | null;
  department_id?: string | null;
  display_order?: number;
  is_active?: boolean;
}

export interface TicketEmployeeRef {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface TicketDepartmentRef {
  id: string;
  name?: string;
}

export interface Ticket {
  id: string;
  ticket_number: string;
  title: string;
  description?: string;
  status: TicketStatus;
  priority: TicketPriority;
  department_id?: string;
  category_id?: string | null;
  requester_id?: string;
  assignee_id?: string | null;
  created_at: string;
  updated_at?: string;
  department?: TicketDepartmentRef | null;
  requester?: TicketEmployeeRef | null;
  assignee?: TicketEmployeeRef | null;
  sla_resolution_breached?: boolean;
  sla_response_breached?: boolean;
  sla_resolution_due_at?: string | null;
  sla_response_due_at?: string | null;
}

export interface TicketListMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface TicketListResponse {
  success: boolean;
  data: Ticket[];
  meta: TicketListMeta;
}

export interface TicketFilters {
  page?: number;
  limit?: number;
  status?: TicketStatus | '';
  priority?: TicketPriority | '';
  department_id?: string;
  assignee_id?: string;
  requester_id?: string;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface CreateTicketPayload {
  title: string;
  description: string;
  department_id: string;
  category_id?: string | null;
  priority: TicketPriority;
}

export interface UpdateTicketPayload {
  title?: string;
  description?: string;
  priority?: TicketPriority;
  department_id?: string;
}

export interface ChangeStatusPayload {
  status: TicketStatus;
  resolution_notes?: string | null;
}

export interface TicketComment {
  id: string;
  ticket_id: string;
  author_id?: string;
  content: string;
  is_internal: boolean;
  created_at: string;
  author?: TicketEmployeeRef | null;
}

export interface TicketAttachment {
  id: string;
  ticket_id: string;
  file_name: string;
  file_path?: string;
  mime_type?: string;
  file_size?: number;
  uploaded_by?: string;
  created_at?: string;
}

export interface TicketTimelineEntry {
  id: string;
  activity_type: string;
  description?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  actor?: TicketEmployeeRef | null;
}

export interface TicketSla {
  response_due_at?: string | null;
  resolution_due_at?: string | null;
  response_breached?: boolean;
  resolution_breached?: boolean;
  status?: string;
  breached?: boolean;
}

export interface TicketAssignment {
  id: string;
  ticket_id: string;
  assignee_id: string;
  assigned_by?: string;
  assignment_type?: string;
  notes?: string | null;
  is_active?: boolean;
  created_at: string;
  assignee?: TicketEmployeeRef | null;
  assigned_by_user?: TicketEmployeeRef | null;
}

export interface TicketWatcher {
  id: string;
  ticket_id: string;
  employee_id: string;
  created_at?: string;
  employee?: TicketEmployeeRef | null;
}

export interface AssignTicketPayload {
  assignee_id: string;
  assignment_type?: string;
  notes?: string;
}

export interface SignedUrlResponse {
  attachment: TicketAttachment;
  signed_url: string;
  expires_in: number;
}
