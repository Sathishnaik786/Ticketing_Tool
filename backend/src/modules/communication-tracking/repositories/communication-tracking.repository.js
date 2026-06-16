const AppError = require('../../../utils/app-error');

function handleDbError(error, notFoundMessage = 'Resource not found') {
  if (!error) return;
  if (error.code === 'PGRST116') {
    throw AppError.notFound(notFoundMessage);
  }
  throw AppError.internal('Unable to complete the requested operation');
}

class CommunicationTrackingRepository {
  constructor(deps = {}) {
    this.db = deps.supabaseAdmin || require('@lib/supabase').supabaseAdmin;
  }

  async getTicketById(ticketId) {
    const { data, error } = await this.db
      .from('tickets')
      .select('id, ticket_number, title, status, department_id, requester_id, assignee_id, created_at')
      .eq('id', ticketId)
      .maybeSingle();

    handleDbError(error, 'Ticket not found');
    if (!data) throw AppError.notFound('Ticket not found');
    return data;
  }

  async getEmployeeDepartmentId(employeeId) {
    if (!employeeId) return null;
    const { data } = await this.db
      .from('employees')
      .select('department_id')
      .eq('id', employeeId)
      .maybeSingle();
    return data?.department_id ?? null;
  }

  async insertCommunication(row) {
    const { data, error } = await this.db
      .from('ticket_communications')
      .insert(row)
      .select('*')
      .single();
    handleDbError(error);
    return data;
  }

  async insertCallLog(row) {
    const { data, error } = await this.db
      .from('ticket_call_logs')
      .insert(row)
      .select('*')
      .single();
    handleDbError(error);
    return data;
  }

  async insertEmailLog(row) {
    const { data, error } = await this.db
      .from('ticket_email_logs')
      .insert(row)
      .select('*')
      .single();
    handleDbError(error);
    return data;
  }

  async insertTimelineEvent(row) {
    const { data, error } = await this.db
      .from('ticket_activity_timeline')
      .insert(row)
      .select('*')
      .single();
    handleDbError(error);
    return data;
  }

  async listCommunicationsByTicket(ticketId, { includeInternal = true } = {}) {
    let query = this.db
      .from('ticket_communications')
      .select(`
        *,
        author:employees!ticket_communications_created_by_fkey(id, first_name, last_name, email)
      `)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: false });

    if (!includeInternal) {
      query = query.eq('visibility', 'PUBLIC');
    }

    const { data, error } = await query;
    handleDbError(error);
    return data || [];
  }

  async listCallLogsByTicket(ticketId) {
    const { data, error } = await this.db
      .from('ticket_call_logs')
      .select(`
        *,
        employee:employees!ticket_call_logs_employee_id_fkey(id, first_name, last_name, email)
      `)
      .eq('ticket_id', ticketId)
      .order('call_start_at', { ascending: false });

    handleDbError(error);
    return data || [];
  }

  async listEmailLogsByTicket(ticketId) {
    const { data, error } = await this.db
      .from('ticket_email_logs')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: false });

    handleDbError(error);
    return data || [];
  }

  async listTimelineEvents(ticketId) {
    const { data, error } = await this.db
      .from('ticket_activity_timeline')
      .select(`
        *,
        actor:employees!ticket_activity_timeline_created_by_fkey(id, first_name, last_name, email)
      `)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: false });

    handleDbError(error);
    return data || [];
  }

  async listAssignmentHistory(ticketId) {
    const { data, error } = await this.db
      .from('ticket_assignment_history')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('changed_at', { ascending: false });

    if (error && error.code !== '42P01') handleDbError(error);
    return data || [];
  }

  async listFeedbackForTicket(ticketId) {
    const { data, error } = await this.db
      .from('ticket_feedback')
      .select('*')
      .eq('ticket_id', ticketId);

    if (error && error.code !== '42P01') handleDbError(error);
    return data || [];
  }

  async listSlaEscalations(ticketId) {
    const { data, error } = await this.db
      .from('ticket_sla_escalation_events')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: false });

    if (error && error.code !== '42P01') handleDbError(error);
    return data || [];
  }

  async listCommunicationsForAnalytics(filters = {}) {
    let query = this.db
      .from('ticket_communications')
      .select('id, ticket_id, communication_type, created_at, created_by, visibility');

    if (filters.fromDate) query = query.gte('created_at', filters.fromDate);
    if (filters.toDate) query = query.lte('created_at', filters.toDate);

    const { data, error } = await query;
    handleDbError(error);
    return data || [];
  }

  async listCallLogsForAnalytics(filters = {}) {
    let query = this.db.from('ticket_call_logs').select('id, ticket_id, created_at, duration_seconds');

    if (filters.fromDate) query = query.gte('created_at', filters.fromDate);
    if (filters.toDate) query = query.lte('created_at', filters.toDate);

    const { data, error } = await query;
    handleDbError(error);
    return data || [];
  }

  async listEmailLogsForAnalytics(filters = {}) {
    let query = this.db.from('ticket_email_logs').select('id, ticket_id, status, created_at');

    if (filters.fromDate) query = query.gte('created_at', filters.fromDate);
    if (filters.toDate) query = query.lte('created_at', filters.toDate);

    const { data, error } = await query;
    handleDbError(error);
    return data || [];
  }

  async getTicketsByIds(ticketIds) {
    if (!ticketIds.length) return [];
    const { data, error } = await this.db
      .from('tickets')
      .select('id, ticket_number, title, department_id, requester_id, assignee_id')
      .in('id', ticketIds);
    handleDbError(error);
    return data || [];
  }

  async getDepartmentsByIds(ids) {
    if (!ids.length) return [];
    const { data } = await this.db.from('departments').select('id, name').in('id', ids);
    return data || [];
  }

  async getRecentCommunications(limit = 10, ticketIds = null) {
    let query = this.db
      .from('ticket_communications')
      .select(`
        *,
        author:employees!ticket_communications_created_by_fkey(id, first_name, last_name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (ticketIds?.length) {
      query = query.in('ticket_id', ticketIds);
    }

    const { data, error } = await query;
    handleDbError(error);
    return data || [];
  }
}

module.exports = CommunicationTrackingRepository;
