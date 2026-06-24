const AppError = require('../../../utils/app-error');

function handleDbError(error, notFoundMessage = 'Resource not found') {
  if (!error) return;
  if (error.code === 'PGRST116') {
    throw AppError.notFound(notFoundMessage);
  }
  throw AppError.internal('Unable to complete the requested operation');
}

class ApprovalManagementRepository {
  constructor(deps = {}) {
    this.db = deps.supabaseAdmin || require('@lib/supabase').supabaseAdmin;
  }

  async getTicketById(ticketId) {
    const { data, error } = await this.db
      .from('tickets')
      .select('id, ticket_number, title, status, department_id, requester_id, assignee_id')
      .eq('id', ticketId)
      .maybeSingle();
    handleDbError(error, 'Ticket not found');
    if (!data) throw AppError.notFound('Ticket not found');
    return data;
  }

  async listCatalogsWithItems() {
    const { data: catalogs, error: catError } = await this.db
      .from('service_catalogs')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    handleDbError(catError);

    const { data: items, error: itemError } = await this.db
      .from('service_catalog_items')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    handleDbError(itemError);

    return (catalogs || []).map((catalog) => ({
      ...catalog,
      items: (items || []).filter((item) => item.catalog_id === catalog.id),
    }));
  }

  async getWorkflowById(workflowId) {
    const { data, error } = await this.db
      .from('approval_workflows')
      .select('*')
      .eq('id', workflowId)
      .maybeSingle();
    handleDbError(error, 'Workflow not found');
    if (!data) throw AppError.notFound('Workflow not found');
    return data;
  }

  async getWorkflowSteps(workflowId) {
    const { data, error } = await this.db
      .from('approval_workflow_steps')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('step_order', { ascending: true });
    handleDbError(error);
    return data || [];
  }

  async createWorkflow(row, steps) {
    const { data: workflow, error } = await this.db
      .from('approval_workflows')
      .insert(row)
      .select('*')
      .single();
    handleDbError(error);

    const stepRows = steps.map((step) => ({
      ...step,
      workflow_id: workflow.id,
    }));

    const { data: insertedSteps, error: stepError } = await this.db
      .from('approval_workflow_steps')
      .insert(stepRows)
      .select('*');
    handleDbError(stepError);

    return { workflow, steps: insertedSteps || [] };
  }

  async updateWorkflow(workflowId, row, steps) {
    const { data: workflow, error } = await this.db
      .from('approval_workflows')
      .update(row)
      .eq('id', workflowId)
      .select('*')
      .single();
    handleDbError(error, 'Workflow not found');

    let updatedSteps = [];
    if (steps) {
      await this.db.from('approval_workflow_steps').delete().eq('workflow_id', workflowId);
      const stepRows = steps.map((step) => ({ ...step, workflow_id: workflowId }));
      const { data, error: stepError } = await this.db
        .from('approval_workflow_steps')
        .insert(stepRows)
        .select('*');
      handleDbError(stepError);
      updatedSteps = data || [];
    } else {
      updatedSteps = await this.getWorkflowSteps(workflowId);
    }

    return { workflow, steps: updatedSteps };
  }

  async getActiveTicketApproval(ticketId) {
    const { data, error } = await this.db
      .from('ticket_approvals')
      .select('*')
      .eq('ticket_id', ticketId)
      .in('status', ['PENDING', 'ESCALATED'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    handleDbError(error);
    return data;
  }

  async getTicketApprovalById(approvalId) {
    const { data, error } = await this.db
      .from('ticket_approvals')
      .select('*')
      .eq('id', approvalId)
      .maybeSingle();
    handleDbError(error, 'Approval not found');
    if (!data) throw AppError.notFound('Approval not found');
    return data;
  }

  async createTicketApproval(row) {
    const { data, error } = await this.db
      .from('ticket_approvals')
      .insert(row)
      .select('*')
      .single();
    handleDbError(error);
    return data;
  }

  async updateTicketApproval(approvalId, row) {
    const { data, error } = await this.db
      .from('ticket_approvals')
      .update(row)
      .eq('id', approvalId)
      .select('*')
      .single();
    handleDbError(error, 'Approval not found');
    return data;
  }

  async insertHistory(row) {
    const { data, error } = await this.db
      .from('approval_history')
      .insert(row)
      .select('*')
      .single();
    handleDbError(error);
    return data;
  }

  async listHistoryByTicket(ticketId) {
    const { data, error } = await this.db
      .from('approval_history')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });
    handleDbError(error);
    return data || [];
  }

  async listMyApprovals(employeeId) {
    const { data, error } = await this.db
      .from('ticket_approvals')
      .select('*')
      .eq('started_by', employeeId)
      .order('created_at', { ascending: false });
    handleDbError(error);
    return data || [];
  }

  async listPendingApprovals() {
    const { data, error } = await this.db
      .from('ticket_approvals')
      .select('*')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: true });
    handleDbError(error);
    return data || [];
  }

  async countApprovalsByStatus() {
    const { data, error } = await this.db
      .from('ticket_approvals')
      .select('status');
    handleDbError(error);
    const rows = data || [];
    return rows.reduce((acc, row) => {
      acc[row.status] = (acc[row.status] || 0) + 1;
      return acc;
    }, {});
  }
}

module.exports = ApprovalManagementRepository;
