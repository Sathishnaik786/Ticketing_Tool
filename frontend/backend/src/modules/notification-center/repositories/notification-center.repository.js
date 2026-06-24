const AppError = require('../../../utils/app-error');

function handleDbError(error) {
  if (!error) return;
  if (error.code === 'PGRST116') return;
  if (error.code === '42P01') return;
  if (error.code === '23505') return;
  throw AppError.internal('Unable to complete the requested operation');
}

async function safeSelect(db, table, queryFn) {
  try {
    const builder = db.from(table).select('*');
    const { data, error } = await queryFn(builder);
    handleDbError(error);
    return data || [];
  } catch {
    return [];
  }
}

class NotificationCenterRepository {
  constructor(deps = {}) {
    this.db = deps.supabaseAdmin || require('@lib/supabase').supabaseAdmin;
  }

  async fetchTimelineEvents(since) {
    return safeSelect(this.db, 'ticket_activity_timeline', (q) => {
      let query = q.order('created_at', { ascending: false }).limit(500);
      if (since) query = query.gte('created_at', since);
      return query;
    });
  }

  async fetchTicketsByIds(ids) {
    if (!ids.length) return [];
    return safeSelect(this.db, 'tickets', (q) => q.in('id', ids));
  }

  async fetchApprovals(since) {
    return safeSelect(this.db, 'ticket_approvals', (q) => {
      let query = q.order('created_at', { ascending: false }).limit(200);
      if (since) query = query.gte('created_at', since);
      return query;
    });
  }

  async fetchFeedback(since) {
    return safeSelect(this.db, 'ticket_feedback', (q) => {
      let query = q.order('created_at', { ascending: false }).limit(200);
      if (since) query = query.gte('created_at', since);
      return query;
    });
  }

  async fetchCommunications(since) {
    return safeSelect(this.db, 'ticket_communications', (q) => {
      let query = q.order('created_at', { ascending: false }).limit(200);
      if (since) query = query.gte('created_at', since);
      return query;
    });
  }

  async fetchPublishedArticles(since) {
    return safeSelect(this.db, 'knowledge_articles', (q) => {
      let query = q.eq('status', 'PUBLISHED').order('published_at', { ascending: false }).limit(100);
      if (since) query = query.gte('published_at', since);
      return query;
    });
  }

  async fetchReports(since) {
    return safeSelect(this.db, 'analytics_reports', (q) => {
      let query = q.order('created_at', { ascending: false }).limit(100);
      if (since) query = query.gte('created_at', since);
      return query;
    });
  }

  async fetchSlaTickets() {
    return safeSelect(this.db, 'tickets', (q) =>
      q.or('sla_response_breached.eq.true,sla_resolution_breached.eq.true').limit(200)
    );
  }

  async findEventByDedup(employeeId, eventType, sourceModule, sourceId) {
    const { data, error } = await this.db
      .from('notification_center_events')
      .select('id')
      .eq('employee_id', employeeId)
      .eq('event_type', eventType)
      .eq('source_module', sourceModule)
      .eq('source_id', String(sourceId))
      .maybeSingle();
    handleDbError(error);
    return data;
  }

  async createEvent(row) {
    const { data, error } = await this.db
      .from('notification_center_events')
      .insert(row)
      .select('*')
      .single();
    if (error?.code === '23505') return null;
    handleDbError(error);
    return data;
  }

  async createDeliveryLog(row) {
    const { data, error } = await this.db
      .from('notification_delivery_log')
      .insert(row)
      .select('*')
      .single();
    handleDbError(error);
    return data;
  }

  async listEvents(employeeId, filters = {}) {
    let query = this.db
      .from('notification_center_events')
      .select('*')
      .eq('employee_id', employeeId)
      .order('created_at', { ascending: false });

    if (filters.status === 'read') query = query.eq('is_read', true);
    if (filters.status === 'unread') query = query.eq('is_read', false);
    if (filters.priority) query = query.eq('priority', filters.priority);
    if (filters.source_module) query = query.eq('source_module', filters.source_module);
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,message.ilike.%${filters.search}%`);
    }

    const limit = filters.limit ?? 50;
    const offset = filters.offset ?? 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;
    handleDbError(error);
    return data || [];
  }

  async countUnread(employeeId) {
    const { count, error } = await this.db
      .from('notification_center_events')
      .select('*', { count: 'exact', head: true })
      .eq('employee_id', employeeId)
      .eq('is_read', false);
    handleDbError(error);
    return count || 0;
  }

  async markRead(id, employeeId) {
    const { data, error } = await this.db
      .from('notification_center_events')
      .update({ is_read: true })
      .eq('id', id)
      .eq('employee_id', employeeId)
      .select('*')
      .maybeSingle();
    handleDbError(error);
    return data;
  }

  async markAllRead(employeeId) {
    const { error } = await this.db
      .from('notification_center_events')
      .update({ is_read: true })
      .eq('employee_id', employeeId)
      .eq('is_read', false);
    handleDbError(error);
    return { success: true };
  }

  async getPreferences(employeeId) {
    const { data, error } = await this.db
      .from('notification_preferences')
      .select('*')
      .eq('employee_id', employeeId)
      .maybeSingle();
    handleDbError(error);
    return data;
  }

  async upsertPreferences(employeeId, prefs) {
    const { data, error } = await this.db
      .from('notification_preferences')
      .upsert({ employee_id: employeeId, ...prefs, updated_at: new Date().toISOString() }, { onConflict: 'employee_id' })
      .select('*')
      .single();
    handleDbError(error);
    return data;
  }

  async listTemplates() {
    const { data, error } = await this.db
      .from('notification_templates')
      .select('*')
      .order('code');
    handleDbError(error);
    return data || [];
  }

  async createTemplate(row) {
    const { data, error } = await this.db.from('notification_templates').insert(row).select('*').single();
    handleDbError(error);
    return data;
  }

  async updateTemplate(id, row) {
    const { data, error } = await this.db
      .from('notification_templates')
      .update({ ...row, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .maybeSingle();
    handleDbError(error);
    return data;
  }

  async deleteTemplate(id) {
    const { error } = await this.db.from('notification_templates').delete().eq('id', id);
    handleDbError(error);
    return { success: true };
  }

  async fetchEventsForAnalytics(filters = {}) {
    let query = this.db.from('notification_center_events').select('*');
    if (filters.from) query = query.gte('created_at', filters.from);
    if (filters.to) query = query.lte('created_at', filters.to);
    if (filters.employee_ids?.length) query = query.in('employee_id', filters.employee_ids);
    const { data, error } = await query;
    handleDbError(error);
    return data || [];
  }

  async fetchDeliveryLogs(eventIds) {
    if (!eventIds.length) return [];
    return safeSelect(this.db, 'notification_delivery_log', (q) => q.in('event_id', eventIds));
  }

  async fetchEmployeesByDepartment(departmentId) {
    return safeSelect(this.db, 'employees', (q) => q.eq('department_id', departmentId));
  }
}

module.exports = NotificationCenterRepository;
