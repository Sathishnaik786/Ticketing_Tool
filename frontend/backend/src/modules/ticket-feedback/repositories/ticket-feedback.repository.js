const AppError = require('../../../utils/app-error');

function handleDbError(error, notFoundMessage = 'Resource not found') {
  if (!error) return;
  if (error.code === 'PGRST116') {
    throw AppError.notFound(notFoundMessage);
  }
  if (error.code === '23505') {
    throw AppError.conflict('Feedback already submitted for this ticket');
  }
  throw AppError.internal('Unable to complete the requested operation');
}

class TicketFeedbackRepository {
  constructor(deps = {}) {
    this.db = deps.supabaseAdmin || require('@lib/supabase').supabaseAdmin;
  }

  async findByTicketId(ticketId) {
    const { data, error } = await this.db
      .from('ticket_feedback')
      .select('*')
      .eq('ticket_id', ticketId)
      .maybeSingle();

    handleDbError(error);
    return data;
  }

  async insertFeedback(payload) {
    const { data, error } = await this.db
      .from('ticket_feedback')
      .insert(payload)
      .select('*')
      .single();

    handleDbError(error);
    return data;
  }

  async findAllWithTicketContext(filters = {}) {
    let query = this.db
      .from('ticket_feedback')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (filters.submittedBy) {
      query = query.eq('submitted_by', filters.submittedBy);
    }
    if (filters.fromDate) {
      query = query.gte('submitted_at', filters.fromDate);
    }
    if (filters.toDate) {
      query = query.lte('submitted_at', filters.toDate);
    }

    const { data: feedbackRows, error } = await query;
    handleDbError(error);
    if (!feedbackRows?.length) return [];

    const ticketIds = [...new Set(feedbackRows.map((row) => row.ticket_id))];
    const { data: tickets, error: ticketError } = await this.db
      .from('tickets')
      .select('id, ticket_number, title, status, department_id, category_id')
      .in('id', ticketIds);

    handleDbError(ticketError);

    const ticketMap = new Map((tickets || []).map((t) => [t.id, t]));
    const departmentIds = [...new Set((tickets || []).map((t) => t.department_id).filter(Boolean))];
    const categoryIds = [...new Set((tickets || []).map((t) => t.category_id).filter(Boolean))];

    let departmentMap = new Map();
    if (departmentIds.length) {
      const { data: departments } = await this.db
        .from('departments')
        .select('id, name')
        .in('id', departmentIds);
      departmentMap = new Map((departments || []).map((d) => [d.id, d]));
    }

    let categoryMap = new Map();
    if (categoryIds.length) {
      const { data: categories } = await this.db
        .from('ticket_categories')
        .select('id, name')
        .in('id', categoryIds);
      categoryMap = new Map((categories || []).map((c) => [c.id, c]));
    }

    return feedbackRows
      .map((row) => {
        const ticket = ticketMap.get(row.ticket_id);
        return {
          ...row,
          tickets: ticket
            ? {
                ...ticket,
                departments: ticket.department_id
                  ? departmentMap.get(ticket.department_id) || null
                  : null,
                ticket_categories: ticket.category_id
                  ? categoryMap.get(ticket.category_id) || null
                  : null,
              }
            : null,
        };
      })
      .filter((row) => {
        if (filters.departmentId && row.tickets?.department_id !== filters.departmentId) {
          return false;
        }
        if (filters.categoryId && row.tickets?.category_id !== filters.categoryId) {
          return false;
        }
        return true;
      });
  }

  async getTicketById(ticketId) {
    const { data, error } = await this.db
      .from('tickets')
      .select('id, status, requester_id, department_id, category_id, ticket_number, title')
      .eq('id', ticketId)
      .single();

    handleDbError(error, 'Ticket not found');
    return data;
  }

  async countBySubmitter(employeeId) {
    const { count, error } = await this.db
      .from('ticket_feedback')
      .select('id', { count: 'exact', head: true })
      .eq('submitted_by', employeeId);

    handleDbError(error);
    return count || 0;
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
}

module.exports = TicketFeedbackRepository;
