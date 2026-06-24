const AppError = require('../../../utils/app-error');
const ApprovalManagementRepository = require('../repositories/approval-management.repository');
const {
  parseSchema,
  CreateWorkflowSchema,
  UpdateWorkflowSchema,
  StartApprovalSchema,
  DecisionSchema,
} = require('../validation/approval-management.validation');
const { WORKFLOW_ADMIN_ROLES } = require('../approval-management.constants');

function normalizeRole(role) {
  return String(role || 'EMPLOYEE').toUpperCase();
}

class ApprovalManagementService {
  constructor(deps = {}) {
    this.repository = deps.repository || new ApprovalManagementRepository(deps);
  }

  assertWorkflowAdmin(user) {
    if (!WORKFLOW_ADMIN_ROLES.includes(normalizeRole(user.role))) {
      throw AppError.forbidden('Only administrators can manage approval workflows');
    }
  }

  canApproveStep(user, step) {
    const role = normalizeRole(user.role);
    if (WORKFLOW_ADMIN_ROLES.includes(role)) return true;
    if (step.approver_employee_id && step.approver_employee_id === user.employeeId) return true;
    return normalizeRole(step.approver_role) === role;
  }

  async getCatalog() {
    const catalogs = await this.repository.listCatalogsWithItems();
    return { success: true, data: catalogs };
  }

  async createWorkflow(user, body) {
    this.assertWorkflowAdmin(user);
    const input = parseSchema(CreateWorkflowSchema, body, 'Workflow');
    const { steps, ...workflowRow } = input;

    const result = await this.repository.createWorkflow(
      {
        ...workflowRow,
        created_by: user.employeeId || null,
      },
      steps
    );

    return { success: true, data: result };
  }

  async updateWorkflow(user, workflowId, body) {
    this.assertWorkflowAdmin(user);
    const input = parseSchema(UpdateWorkflowSchema, body, 'Workflow');
    const { steps, ...workflowRow } = input;

    const result = await this.repository.updateWorkflow(workflowId, workflowRow, steps);
    return { success: true, data: result };
  }

  async getWorkflow(workflowId) {
    const workflow = await this.repository.getWorkflowById(workflowId);
    const steps = await this.repository.getWorkflowSteps(workflowId);
    return { success: true, data: { workflow, steps } };
  }

  async startTicketApproval(user, ticketId, body) {
    if (!user.employeeId) throw AppError.forbidden('Employee profile required');

    const input = parseSchema(StartApprovalSchema, body, 'Start approval');
    const ticket = await this.repository.getTicketById(ticketId);

    const existing = await this.repository.getActiveTicketApproval(ticketId);
    if (existing) {
      throw AppError.conflict('An active approval workflow already exists for this ticket');
    }

    const workflow = await this.repository.getWorkflowById(input.workflow_id);
    if (!workflow.is_active) throw AppError.badRequest('Workflow is not active');

    const steps = await this.repository.getWorkflowSteps(workflow.id);
    if (steps.length === 0) throw AppError.badRequest('Workflow has no steps');

    const firstStep = steps[0];
    const approval = await this.repository.createTicketApproval({
      ticket_id: ticketId,
      workflow_id: workflow.id,
      current_step_id: firstStep.id,
      status: 'PENDING',
      started_by: user.employeeId,
    });

    await this.repository.insertHistory({
      ticket_approval_id: approval.id,
      ticket_id: ticketId,
      step_id: firstStep.id,
      action: 'SUBMITTED',
      actor_id: user.employeeId,
      actor_role: normalizeRole(user.role),
      comments: input.comments || null,
      metadata: { ticket_number: ticket.ticket_number, workflow_name: workflow.name },
    });

    return { success: true, data: { approval, workflow, steps, current_step: firstStep } };
  }

  async approveTicketStep(user, ticketId, body) {
    const input = parseSchema(DecisionSchema, body, 'Approve');
    return this._decide(user, ticketId, 'APPROVED', input.comments);
  }

  async rejectTicketStep(user, ticketId, body) {
    const input = parseSchema(DecisionSchema, body, 'Reject');
    return this._decide(user, ticketId, 'REJECTED', input.comments);
  }

  async _decide(user, ticketId, decision, comments) {
    if (!user.employeeId) throw AppError.forbidden('Employee profile required');

    const approval = await this.repository.getActiveTicketApproval(ticketId);
    if (!approval) throw AppError.notFound('No active approval found for this ticket');

    const steps = await this.repository.getWorkflowSteps(approval.workflow_id);
    const currentStep = steps.find((s) => s.id === approval.current_step_id);
    if (!currentStep) throw AppError.badRequest('Current approval step is invalid');

    if (!this.canApproveStep(user, currentStep)) {
      throw AppError.forbidden('You are not authorized to act on this approval step');
    }

    if (decision === 'REJECTED') {
      const updated = await this.repository.updateTicketApproval(approval.id, {
        status: 'REJECTED',
        completed_at: new Date().toISOString(),
        current_step_id: null,
      });

      await this.repository.insertHistory({
        ticket_approval_id: approval.id,
        ticket_id: ticketId,
        step_id: currentStep.id,
        action: 'REJECTED',
        actor_id: user.employeeId,
        actor_role: normalizeRole(user.role),
        comments: comments || null,
        metadata: { step_name: currentStep.step_name },
      });

      return { success: true, data: { approval: updated, status: 'REJECTED' } };
    }

    const currentIndex = steps.findIndex((s) => s.id === currentStep.id);
    const nextStep = steps[currentIndex + 1];

    if (!nextStep) {
      const updated = await this.repository.updateTicketApproval(approval.id, {
        status: 'APPROVED',
        completed_at: new Date().toISOString(),
        current_step_id: null,
      });

      await this.repository.insertHistory({
        ticket_approval_id: approval.id,
        ticket_id: ticketId,
        step_id: currentStep.id,
        action: 'APPROVED',
        actor_id: user.employeeId,
        actor_role: normalizeRole(user.role),
        comments: comments || null,
        metadata: { step_name: currentStep.step_name, final: true },
      });

      return { success: true, data: { approval: updated, status: 'APPROVED' } };
    }

    const updated = await this.repository.updateTicketApproval(approval.id, {
      current_step_id: nextStep.id,
      status: 'PENDING',
    });

    await this.repository.insertHistory({
      ticket_approval_id: approval.id,
      ticket_id: ticketId,
      step_id: currentStep.id,
      action: 'APPROVED',
      actor_id: user.employeeId,
      actor_role: normalizeRole(user.role),
      comments: comments || null,
      metadata: { step_name: currentStep.step_name, next_step: nextStep.step_name },
    });

    return {
      success: true,
      data: { approval: updated, status: 'PENDING', current_step: nextStep },
    };
  }

  async getMyApprovals(user) {
    if (!user.employeeId) throw AppError.forbidden('Employee profile required');
    const approvals = await this.repository.listMyApprovals(user.employeeId);
    return { success: true, data: approvals };
  }

  async getPendingApprovals(user) {
    const role = normalizeRole(user.role);
    const allPending = await this.repository.listPendingApprovals();
    const result = [];

    for (const approval of allPending) {
      const steps = await this.repository.getWorkflowSteps(approval.workflow_id);
      const currentStep = steps.find((s) => s.id === approval.current_step_id);
      if (!currentStep) continue;
      if (this.canApproveStep(user, currentStep)) {
        result.push({ ...approval, current_step: currentStep });
      }
    }

    if (WORKFLOW_ADMIN_ROLES.includes(role) && result.length === 0) {
      return { success: true, data: allPending };
    }

    return { success: true, data: result };
  }

  async getTicketApprovalState(user, ticketId) {
    await this.repository.getTicketById(ticketId);
    const approval = await this.repository.getActiveTicketApproval(ticketId);
    const history = await this.repository.listHistoryByTicket(ticketId);

    if (!approval) {
      const { data: completed } = await this.repository.db
        .from('ticket_approvals')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      return {
        success: true,
        data: {
          active: null,
          latest: completed || null,
          history,
        },
      };
    }

    const steps = await this.repository.getWorkflowSteps(approval.workflow_id);
    const currentStep = steps.find((s) => s.id === approval.current_step_id);

    return {
      success: true,
      data: {
        active: approval,
        workflow: await this.repository.getWorkflowById(approval.workflow_id),
        steps,
        current_step: currentStep,
        history,
        can_act: currentStep ? this.canApproveStep(user, currentStep) : false,
      },
    };
  }

  async getAnalytics(user) {
    const role = normalizeRole(user.role);
    if (!['ADMIN', 'HR', 'SUPER_ADMIN', 'MANAGER'].includes(role)) {
      throw AppError.forbidden('Insufficient permissions for approval analytics');
    }

    const statusCounts = await this.repository.countApprovalsByStatus();
    const pending = await this.repository.listPendingApprovals();

    return {
      success: true,
      data: {
        statusCounts,
        pendingCount: pending.length,
        totalApprovals: Object.values(statusCounts).reduce((a, b) => a + b, 0),
      },
    };
  }
}

module.exports = ApprovalManagementService;
