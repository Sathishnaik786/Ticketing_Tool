const repository = require('./workflow.repository');
const eventStore = require('../event-store/eventStore.service');
const { getQueue } = require('../../lib/queue');
const logger = require('../../lib/auditLogger');
const { supabaseAdmin } = require('../../lib/supabase');

class WorkflowService {
  async startWorkflowForTicket(tenantId, ticketId, workflowId, actorId) {
    logger.info(`Starting workflow for ticket: ${ticketId}`, { ticketId, workflowId });

    // 1. Fetch published version
    const version = await repository.getPublishedVersion(tenantId, workflowId);
    if (!version) {
      logger.warn(`No active published version found for workflow ${workflowId}. Skipping.`);
      return null;
    }

    // 2. Fetch steps
    const steps = await repository.getVersionSteps(tenantId, version.id);
    if (!steps || steps.length === 0) {
      logger.warn(`No steps found for workflow version ${version.id}. Skipping.`);
      return null;
    }

    const firstStep = steps[0];

    // 3. Set Ticket Workflow Run State
    const runState = await repository.setTicketWorkflowState({
      tenant_id: tenantId,
      ticket_id: ticketId,
      version_id: version.id,
      current_step_id: firstStep.id,
      state_status: 'IN_PROGRESS'
    });

    // 4. Record Event
    await eventStore.recordEvent({
      tenant_id: tenantId,
      aggregate_type: 'TICKET_WORKFLOW',
      aggregate_id: ticketId,
      event_type: 'workflow.started',
      payload: {
        version_id: version.id,
        current_step_id: firstStep.id,
        status: 'IN_PROGRESS'
      },
      actor_id: actorId
    });

    // 5. Enqueue step processing via BullMQ
    const queue = getQueue('workflow-queue');
    await queue.add('processStep', {
      tenantId,
      ticketId,
      versionId: version.id,
      stepId: firstStep.id,
      depth: 1
    });

    return runState;
  }

  async advanceStep(tenantId, ticketId, depth = 1) {
    logger.info(`Advancing workflow step for ticket: ${ticketId}, depth: ${depth}`, { ticketId, depth });

    if (depth > 10) {
      // Loop protection trigger (Rule 7)
      logger.error(`Workflow Loop Detected: Maximum execution depth of 10 reached on ticket: ${ticketId}`);
      await repository.setTicketWorkflowState({
        tenant_id: tenantId,
        ticket_id: ticketId,
        state_status: 'SUSPENDED'
      });
      return;
    }

    const runState = await repository.getTicketWorkflowState(tenantId, ticketId);
    if (!runState || runState.state_status !== 'IN_PROGRESS') {
      logger.info(`Workflow execution not active or suspended for ticket: ${ticketId}`);
      return;
    }

    const steps = await repository.getVersionSteps(tenantId, runState.version_id);
    const currentIndex = steps.findIndex(s => s.id === runState.current_step_id);

    if (currentIndex === -1 || currentIndex === steps.length - 1) {
      // Reached terminal step
      await repository.setTicketWorkflowState({
        tenant_id: tenantId,
        ticket_id: ticketId,
        current_step_id: runState.current_step_id,
        state_status: 'COMPLETED'
      });

      await eventStore.recordEvent({
        tenant_id: tenantId,
        aggregate_type: 'TICKET_WORKFLOW',
        aggregate_id: ticketId,
        event_type: 'workflow.completed',
        payload: {
          version_id: runState.version_id,
          status: 'COMPLETED'
        }
      });

      logger.info(`Workflow execution completed for ticket: ${ticketId}`);
      return;
    }

    const nextStep = steps[currentIndex + 1];

    await repository.setTicketWorkflowState({
      tenant_id: tenantId,
      ticket_id: ticketId,
      version_id: runState.version_id,
      current_step_id: nextStep.id,
      state_status: 'IN_PROGRESS'
    });

    const queue = getQueue('workflow-queue');
    await queue.add('processStep', {
      tenantId,
      ticketId,
      versionId: runState.version_id,
      stepId: nextStep.id,
      depth: depth + 1
    });
  }

  async executeStepDetails(tenantId, ticketId, versionId, stepId, depth) {
    const { data: step, error } = await supabaseAdmin
      .from('workflow_steps')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('id', stepId)
      .single();

    if (error || !step) {
      logger.error(`Failed to load step details for step: ${stepId}`, { error });
      return;
    }

    logger.info(`Processing workflow step: ${step.name} (${step.type}) for ticket: ${ticketId}`);

    if (step.type === 'NOTIFICATION') {
      const templateKey = step.configuration?.template_key || 'TICKET_ASSIGNED';
      const recipientId = step.assigned_user_id || '11111111-1111-1111-1111-111111111111';

      // Queue notification dispatch
      const queue = getQueue('notify-queue');
      await queue.add('sendNotification', {
        tenantId,
        recipientId,
        templateKey,
        data: { ticket_id: ticketId }
      });

      // Synchronously advance to the next step
      await this.advanceStep(tenantId, ticketId, depth);
    } 
    else if (step.type === 'APPROVAL') {
      // Trigger approval process assignments
      const approvalQueue = getQueue('approval-queue');
      await approvalQueue.add('createApproval', {
        tenantId,
        ticketId,
        stepName: step.name,
        assignedRole: step.assigned_role,
        assignedUserId: step.assigned_user_id
      });
      // Do not advance: wait for approval.completed event callback
    }
    else {
      // Generic task / placeholder step: advance automatically
      await this.advanceStep(tenantId, ticketId, depth);
    }
  }
}

const serviceInstance = new WorkflowService();

module.exports = serviceInstance;
