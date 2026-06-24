const AppError = require('../../utils/app-error');

function handleDbError(error, notFoundMessage = 'Resource not found') {
  if (!error) return;
  if (error.code === 'PGRST116') {
    throw AppError.notFound(notFoundMessage);
  }
  throw AppError.internal('Unable to complete the requested operation');
}

const DB_ASSIGNMENT_TYPES = new Set(['MANUAL', 'ROUND_ROBIN', 'QUEUE', 'SKILL_BASED']);

function mapAssignmentTypeToDb(type) {
  if (DB_ASSIGNMENT_TYPES.has(type)) return type;
  if (type === 'AUTO') return 'QUEUE';
  return 'MANUAL';
}

class TicketAssignmentRepository {
  constructor(deps = {}) {
    this.db = deps.supabaseAdmin || require('@lib/supabase').supabaseAdmin;
  }

  async getTicketById(ticketId) {
    const { data, error } = await this.db
      .from('tickets')
      .select('id, ticket_number, title, status, priority, department_id, category_id, requester_id, assignee_id, created_at, updated_at')
      .eq('id', ticketId)
      .single();

    handleDbError(error, 'Ticket not found');
    return data;
  }

  async getEmployeeDepartmentId(employeeId) {
    if (!employeeId) return null;
    const { data, error } = await this.db
      .from('employees')
      .select('department_id')
      .eq('id', employeeId)
      .maybeSingle();
    handleDbError(error);
    return data?.department_id || null;
  }

  async clearCurrentAssignment(ticketId) {
    const { error } = await this.db
      .from('ticket_assignments')
      .update({
        is_current: false,
        unassigned_at: new Date().toISOString(),
      })
      .eq('ticket_id', ticketId)
      .eq('is_current', true);
    if (error) throw AppError.internal('Unable to update assignment history');
  }

  async insertAssignment({ ticketId, assigneeId, assignedBy, assignmentType, notes }) {
    const { data, error } = await this.db
      .from('ticket_assignments')
      .insert([{
        ticket_id: ticketId,
        assignee_id: assigneeId,
        assigned_by: assignedBy,
        assignment_type: assignmentType,
        is_current: true,
        notes: notes || null,
      }])
      .select('*')
      .single();
    if (error) throw AppError.internal('Unable to assign ticket');
    return data;
  }

  async updateTicketAssignee(ticketId, assigneeId, status) {
    const { data, error } = await this.db
      .from('tickets')
      .update({ assignee_id: assigneeId, status })
      .eq('id', ticketId)
      .select('*')
      .single();
    if (error) throw AppError.internal('Unable to update ticket');
    return data;
  }

  async insertHistory({ ticketId, oldAssignee, newAssignee, changedBy, reason }) {
    const { data, error } = await this.db
      .from('ticket_assignment_history')
      .insert([{
        ticket_id: ticketId,
        old_assignee: oldAssignee || null,
        new_assignee: newAssignee || null,
        changed_by: changedBy,
        reason: reason || null,
      }])
      .select('*')
      .single();
    if (error) throw AppError.internal('Unable to record assignment history');
    return data;
  }

  async listTickets(filters = {}) {
    let query = this.db
      .from('tickets')
      .select('id, ticket_number, title, status, priority, department_id, assignee_id, requester_id, created_at, updated_at', { count: 'exact' });

    if (filters.assigneeId) query = query.eq('assignee_id', filters.assigneeId);
    if (filters.departmentId) query = query.eq('department_id', filters.departmentId);
    if (filters.unassigned) query = query.is('assignee_id', null);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.priority) query = query.eq('priority', filters.priority);

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.order('updated_at', { ascending: false }).range(from, to);

    const { data, error, count } = await query;
    handleDbError(error);

    let rows = data || [];
    if (filters.excludeClosed) {
      rows = rows.filter((ticket) => ticket.status !== 'CLOSED');
    }

    return { data: rows, count: filters.excludeClosed ? rows.length : (count || 0) };
  }

  async listHistory(filters = {}) {
    let query = this.db
      .from('ticket_assignment_history')
      .select('*')
      .order('changed_at', { ascending: false });

    if (filters.ticketId) query = query.eq('ticket_id', filters.ticketId);
    if (filters.fromDate) query = query.gte('changed_at', filters.fromDate);
    if (filters.toDate) query = query.lte('changed_at', filters.toDate);

    const { data, error } = await query;
    handleDbError(error);
    return data || [];
  }

  async countAssignmentsByAssignee() {
    const { data, error } = await this.db
      .from('tickets')
      .select('assignee_id, status');

    handleDbError(error);
    const counts = new Map();
    (data || [])
      .filter((row) => row.assignee_id && row.status !== 'CLOSED')
      .forEach((row) => {
        counts.set(row.assignee_id, (counts.get(row.assignee_id) || 0) + 1);
      });
    return counts;
  }
}

module.exports = TicketAssignmentRepository;
module.exports.mapAssignmentTypeToDb = mapAssignmentTypeToDb;
