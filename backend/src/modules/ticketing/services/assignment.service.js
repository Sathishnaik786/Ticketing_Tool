const AppError = require('../../../utils/app-error');
const {
  ACTIVITY_TYPES,
  assertPermission,
  canAssignTicket,
  validateStatusTransition,
  successResponse,
} = require('../ticketing.types');
const { AssignTicketSchema, parseSchema } = require('../validators/ticketing.validator');

class AssignmentService {
  constructor(deps = {}) {
    this.db = deps.supabaseAdmin || require('@lib/supabase').supabaseAdmin;
    const sharedDeps = { ...deps, supabaseAdmin: this.db };
    this.activityService = deps.activityService || new (require('./activity.service'))(sharedDeps);
    this.notificationService = deps.notificationService || new (require('./notification.service'))(sharedDeps);
    this.ticketAccess = deps.ticketAccess || require('./ticket-access.helper');
  }

  async assignTicket(user, ticketId, payload) {
    assertPermission(user, 'ASSIGN_TICKET');
    const input = parseSchema(AssignTicketSchema, payload, 'Assign ticket');

    const ticket = await this.ticketAccess.getTicketOrThrow(this.db, ticketId);
    const context = await this.ticketAccess.buildAccessContext(this.db, user);

    if (!canAssignTicket(user, ticket, context)) {
      throw AppError.forbidden('You do not have permission to assign this ticket');
    }

    await this._clearCurrentAssignment(ticketId);

    const { data: assignment, error: assignmentError } = await this.db
      .from('ticket_assignments')
      .insert([{
        ticket_id: ticketId,
        assignee_id: input.assignee_id,
        assigned_by: user.employeeId,
        assignment_type: input.assignment_type,
        is_current: true,
        notes: input.notes || null,
      }])
      .select()
      .single();

    if (assignmentError) {
      throw AppError.internal('Unable to assign ticket');
    }

    const nextStatus = ticket.status === 'OPEN' ? 'ASSIGNED' : ticket.status;
    const { data: updatedTicket, error: ticketError } = await this.db
      .from('tickets')
      .update({
        assignee_id: input.assignee_id,
        status: nextStatus,
      })
      .eq('id', ticketId)
      .select()
      .single();

    if (ticketError) {
      throw AppError.internal('Unable to update ticket assignment');
    }

    await this.activityService.logActivity({
      ticketId,
      actorId: user.employeeId,
      activityType: ACTIVITY_TYPES.ASSIGNMENT,
      newValue: {
        assignee_id: input.assignee_id,
        assignment_type: input.assignment_type,
      },
    });

    const assigneeUserId = await this.ticketAccess.getEmployeeUserId(this.db, input.assignee_id);
    
    const eventStore = require('../../event-store/eventStore.service');
    const { resolveTenantId } = require('@lib/tenantResolver');
    const tenantId = await resolveTenantId(user);
    await eventStore.recordEvent({
      tenant_id: tenantId,
      aggregate_type: 'TICKET',
      aggregate_id: ticketId,
      event_type: 'ticket.assigned',
      payload: {
        ticket_id: ticketId,
        assignee_id: input.assignee_id,
        assignee_user_id: assigneeUserId,
        assignment_id: assignment.id
      },
      actor_id: user.id
    });

    await this.notificationService.notifyTicketAssigned({
      recipientUserId: assigneeUserId,
      ticketId,
      ticketNumber: updatedTicket.ticket_number,
      title: updatedTicket.title,
    });

    const { logTicketingEvent } = require('../lib/ticketing-logger');
    logTicketingEvent('ticket_assigned', { ticketId });

    return successResponse({ ticket: updatedTicket, assignment });
  }

  async reassignTicket(user, ticketId, payload) {
    assertPermission(user, 'ASSIGN_TICKET');
    const input = parseSchema(AssignTicketSchema, payload, 'Reassign ticket');

    const ticket = await this.ticketAccess.getTicketOrThrow(this.db, ticketId);
    const context = await this.ticketAccess.buildAccessContext(this.db, user);

    if (!canAssignTicket(user, ticket, context)) {
      throw AppError.forbidden('You do not have permission to reassign this ticket');
    }

    const previousAssigneeId = ticket.assignee_id;
    await this._clearCurrentAssignment(ticketId);

    const { data: assignment, error: assignmentError } = await this.db
      .from('ticket_assignments')
      .insert([{
        ticket_id: ticketId,
        assignee_id: input.assignee_id,
        assigned_by: user.employeeId,
        assignment_type: input.assignment_type,
        is_current: true,
        notes: input.notes || null,
      }])
      .select()
      .single();

    if (assignmentError) {
      throw AppError.internal('Unable to reassign ticket');
    }

    const { data: updatedTicket, error: ticketError } = await this.db
      .from('tickets')
      .update({ assignee_id: input.assignee_id })
      .eq('id', ticketId)
      .select()
      .single();

    if (ticketError) {
      throw AppError.internal('Unable to update ticket reassignment');
    }

    await this.activityService.logActivity({
      ticketId,
      actorId: user.employeeId,
      activityType: ACTIVITY_TYPES.REASSIGNMENT,
      oldValue: { assignee_id: previousAssigneeId },
      newValue: { assignee_id: input.assignee_id },
    });

    const assigneeUserId = await this.ticketAccess.getEmployeeUserId(this.db, input.assignee_id);
    
    const eventStore = require('../../event-store/eventStore.service');
    const { resolveTenantId } = require('@lib/tenantResolver');
    const tenantId = await resolveTenantId(user);
    await eventStore.recordEvent({
      tenant_id: tenantId,
      aggregate_type: 'TICKET',
      aggregate_id: ticketId,
      event_type: 'ticket.assigned',
      payload: {
        ticket_id: ticketId,
        assignee_id: input.assignee_id,
        assignee_user_id: assigneeUserId,
        previous_assignee_id: previousAssigneeId,
        assignment_id: assignment.id
      },
      actor_id: user.id
    });

    await this.notificationService.notifyTicketReassigned({
      recipientUserId: assigneeUserId,
      ticketId,
      ticketNumber: updatedTicket.ticket_number,
      title: updatedTicket.title,
    });

    const { logTicketingEvent } = require('../lib/ticketing-logger');
    logTicketingEvent('ticket_reassigned', { ticketId });

    return successResponse({ ticket: updatedTicket, assignment });
  }

  async getAssignmentHistory(user, ticketId) {
    const ticket = await this.ticketAccess.getTicketOrThrow(this.db, ticketId);
    await this.ticketAccess.assertCanView(this.db, user, ticket);

    const { data, error } = await this.db
      .from('ticket_assignments')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('assigned_at', { ascending: false });

    if (error) {
      throw AppError.internal('Unable to fetch assignment history');
    }

    return successResponse(data || []);
  }

  async _clearCurrentAssignment(ticketId) {
    const { error } = await this.db
      .from('ticket_assignments')
      .update({
        is_current: false,
        unassigned_at: new Date().toISOString(),
      })
      .eq('ticket_id', ticketId)
      .eq('is_current', true);

    if (error) {
      throw AppError.internal('Unable to update assignment history');
    }
  }
}

module.exports = AssignmentService;
