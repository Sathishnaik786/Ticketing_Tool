const repository = require('./approval.repository');
const eventStore = require('../event-store/eventStore.service');
const logger = require('../../lib/auditLogger');
const { getQueue } = require('../../lib/queue');
const { supabaseAdmin } = require('../../lib/supabase');

class ApprovalService {
  async evaluateAndCreateAssignments(tenantId, ticketId, stepName, assignedRole, assignedUserId) {
    logger.info(`Creating approval assignment for step: ${stepName} on ticket: ${ticketId}`);

    // Fetch dynamic policy matching this step
    const { data: policies } = await supabaseAdmin
      .from('approval_policies')
      .select('*, approval_levels(*)')
      .eq('tenant_id', tenantId)
      .eq('name', stepName)
      .eq('is_active', true);

    const policy = policies?.[0] || null;
    let levelId = null;

    if (policy && policy.approval_levels?.length > 0) {
      // Use levels configuration
      const firstLevel = policy.approval_levels.sort((a,b) => a.level_order - b.level_order)[0];
      levelId = firstLevel.id;
    }

    // Set escalation duration (default 24 hours)
    const escalatesAt = new Date();
    escalatesAt.setHours(escalatesAt.getHours() + 24);

    const assignment = await repository.createAssignment({
      tenant_id: tenantId,
      level_id: levelId,
      ticket_id: ticketId,
      assigned_role: assignedRole || null,
      assigned_user_id: assignedUserId || null,
      status: 'PENDING',
      escalates_at: escalatesAt.toISOString()
    });

    // Record Event
    await eventStore.recordEvent({
      tenant_id: tenantId,
      aggregate_type: 'APPROVAL',
      aggregate_id: assignment.id,
      event_type: 'approval.created',
      payload: {
        assignment_id: assignment.id,
        ticket_id: ticketId,
        assigned_role: assignedRole,
        assigned_user_id: assignedUserId
      }
    });

    // Enqueue escalation monitoring task
    const queue = getQueue('approval-queue');
    await queue.add('monitorEscalation', {
      tenantId,
      assignmentId: assignment.id
    }, {
      delay: 24 * 60 * 60 * 1000 // 24 hours delay
    });

    return assignment;
  }

  async processApprovalAction(user, payload) {
    const { resolveTenantId } = require('../../lib/tenantResolver');
    const tenantId = await resolveTenantId(user);
    const { assignment_id, action, comments } = payload; // action: APPROVED or REJECTED

    const assignment = await repository.getPendingAssignment(tenantId, assignment_id);
    if (!assignment) {
      throw new Error('Approval assignment not found or already processed.');
    }

    // Security Gate: Prevent approval forgery (Rule 7)
    // Asserts caller belongs to assigned_user_id or holds the target role
    const isOwner = assignment.assigned_user_id === user.id;
    const hasRole = assignment.assigned_role && user.role === assignment.assigned_role;
    
    if (!isOwner && !hasRole && user.role !== 'ADMIN') {
      throw new Error('Security Gate: Unauthorized attempt to approve this step.');
    }

    // Update assignment status
    const statusVal = action === 'APPROVED' ? 'APPROVED' : 'REJECTED';
    const updated = await repository.updateAssignmentStatus(tenantId, assignment_id, statusVal);

    // Save history log
    await repository.createHistoryLog({
      tenant_id: tenantId,
      assignment_id,
      actor_id: user.id,
      action: statusVal,
      comments: comments || ''
    });

    // Write to Event Store
    const eventType = statusVal === 'APPROVED' ? 'approval.completed' : 'approval.rejected';
    await eventStore.recordEvent({
      tenant_id: tenantId,
      aggregate_type: 'APPROVAL',
      aggregate_id: assignment_id,
      event_type: eventType,
      payload: {
        assignment_id,
        ticket_id: assignment.ticket_id,
        action: statusVal,
        comments
      },
      actor_id: user.id
    });

    if (statusVal === 'APPROVED') {
      // Verify if other sibling assignments at this level are pending
      const ticketAssignments = await repository.getTicketAssignments(tenantId, assignment.ticket_id);
      const levelPending = ticketAssignments.some(a => a.level_id === assignment.level_id && a.status === 'PENDING');

      if (!levelPending) {
        // Advance workflow step
        const workflowService = require('../workflow-engine/workflow.service');
        await workflowService.advanceStep(tenantId, assignment.ticket_id, 1);
      }
    } else {
      // Rejection: Suspend workflow state
      await supabaseAdmin
        .from('ticket_workflow_state')
        .update({ state_status: 'SUSPENDED' })
        .eq('tenant_id', tenantId)
        .eq('ticket_id', assignment.ticket_id);
      
      logger.info(`Workflow suspended on ticket: ${assignment.ticket_id} due to approval rejection.`);
    }

    return updated;
  }

  async runEscalationProcess(tenantId, assignmentId) {
    const assignment = await repository.getPendingAssignment(tenantId, assignmentId);
    if (!assignment) return; // Already resolved

    logger.warn(`Escalation deadline reached for approval: ${assignmentId} on ticket: ${assignment.ticket_id}`);

    // Update status to ESCALATED
    await repository.updateAssignmentStatus(tenantId, assignmentId, 'ESCALATED');

    await repository.createHistoryLog({
      tenant_id: tenantId,
      assignment_id: assignmentId,
      action: 'ESCALATED',
      comments: 'Automatic escalation triggered by timeout SLA.'
    });

    // Notify ticket workflow manager or override assignee
    // Send email alert to admins
    const notifyQueue = getQueue('notify-queue');
    await notifyQueue.add('sendNotification', {
      tenantId,
      recipientId: '11111111-1111-1111-1111-111111111111', // Admin group fallback
      templateKey: 'SLA_BREACHED',
      data: { ticket_id: assignment.ticket_id }
    });
  }
}

const serviceInstance = new ApprovalService();

module.exports = serviceInstance;
