const AppError = require('../../../utils/app-error');

function handleDbError(error) {
  if (!error) return;
  if (error.code === 'PGRST116') return;
  if (error.code === '42P01') return;
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

class ExecutiveAnalyticsRepository {
  constructor(deps = {}) {
    this.db = deps.supabaseAdmin || require('@lib/supabase').supabaseAdmin;
  }

  async fetchTickets(filters = {}) {
    return safeSelect(this.db, 'tickets', async (q) => {
      let query = q;
      if (filters.from) query = query.gte('created_at', filters.from);
      if (filters.to) query = query.lte('created_at', filters.to);
      if (filters.department_id) query = query.eq('department_id', filters.department_id);
      return query;
    });
  }

  async fetchDepartments() {
    return safeSelect(this.db, 'departments', (q) => q);
  }

  async fetchFeedback() {
    return safeSelect(this.db, 'ticket_feedback', (q) => q);
  }

  async fetchApprovals() {
    return safeSelect(this.db, 'ticket_approvals', (q) => q);
  }

  async fetchAssignmentHistory() {
    return safeSelect(this.db, 'ticket_assignment_history', (q) => q);
  }

  async fetchEscalations() {
    return safeSelect(this.db, 'ticket_sla_escalation_events', (q) => q);
  }

  async fetchCommunications() {
    return safeSelect(this.db, 'ticket_communications', (q) => q);
  }

  async fetchKnowledgeViews() {
    return safeSelect(this.db, 'knowledge_article_views', (q) => q);
  }

  async fetchKnowledgeArticles() {
    return safeSelect(this.db, 'knowledge_articles', (q) => q.eq('status', 'PUBLISHED'));
  }

  async fetchBusinessUnits() {
    return safeSelect(this.db, 'business_units', (q) => q.eq('is_active', true));
  }

  async fetchBuDepartmentMap() {
    return safeSelect(this.db, 'department_business_unit_map', (q) => q);
  }

  async createReport(row) {
    const { data, error } = await this.db.from('analytics_reports').insert(row).select('*').single();
    handleDbError(error);
    return data;
  }

  async listReports(userId) {
    const { data, error } = await this.db
      .from('analytics_reports')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });
    handleDbError(error);
    return data || [];
  }

  async createSnapshot(row) {
    const { data, error } = await this.db.from('analytics_snapshots').insert(row).select('*').single();
    handleDbError(error);
    return data;
  }

  async getDashboardConfig(key) {
    const { data, error } = await this.db
      .from('analytics_dashboard_configs')
      .select('*')
      .eq('dashboard_key', key)
      .maybeSingle();
    handleDbError(error);
    return data;
  }
}

module.exports = ExecutiveAnalyticsRepository;
