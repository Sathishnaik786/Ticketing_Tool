const AppError = require('../../../utils/app-error');
const {
  ACTIVITY_TYPES,
  assertPermission,
  canViewTicket,
  hasPermission,
  validateStatusTransition,
  successResponse,
} = require('../ticketing.types');
const {
  CreateTicketSchema,
  UpdateTicketSchema,
  TicketListQuerySchema,
  ChangeStatusSchema,
  parseSchema,
} = require('../validators/ticketing.validator');

class TicketService {
  constructor(deps = {}) {
    this.db = deps.supabaseAdmin || require('@lib/supabase').supabaseAdmin;
    const sharedDeps = { ...deps, supabaseAdmin: this.db };
    this.activityService = deps.activityService || new (require('./activity.service'))(sharedDeps);
    this.slaService = deps.slaService || new (require('./sla.service'))(sharedDeps);
    this.notificationService = deps.notificationService || new (require('./notification.service'))(sharedDeps);
    this.ticketAccess = deps.ticketAccess || require('./ticket-access.helper');
  }

  async createTicket(user, payload) {
    assertPermission(user, 'CREATE_TICKET');
    const input = parseSchema(CreateTicketSchema, payload, 'Create ticket');

    if (!user.employeeId || !user.id) {
      throw AppError.badRequest('Authenticated employee context is required');
    }

    const { dueDates } = (await this.slaService.resolveDueDates(input)).data;

    const { data, error } = await this.db
      .from('tickets')
      .insert([{
        title: input.title,
        description: input.description,
        department_id: input.department_id || null,
        category_id: input.category_id || null,
        subcategory_id: input.subcategory_id || null,
        priority: input.priority,
        status: 'OPEN',
        requester_id: user.employeeId,
        created_by: user.id,
        ...dueDates,
      }])
      .select()
      .single();

    if (error) {
      throw AppError.internal('Unable to create ticket');
    }

    await this.activityService.logActivity({
      ticketId: data.id,
      actorId: user.employeeId,
      activityType: ACTIVITY_TYPES.CREATED,
      newValue: { status: data.status, priority: data.priority },
      description: 'Ticket created',
    });

    const { logTicketingEvent } = require('../lib/ticketing-logger');
    logTicketingEvent('ticket_created', {
      ticketId: data.id,
      status: data.status,
      priority: data.priority,
      categoryId: data.category_id,
    });

    const requesterUserId = user.id;
    await this.notificationService.notifyTicketCreated({
      recipientUserId: requesterUserId,
      ticketId: data.id,
      ticketNumber: data.ticket_number,
      title: data.title,
    });

    if (data.assignee_id) {
      const assigneeUserId = await this.ticketAccess.getEmployeeUserId(this.db, data.assignee_id);
      await this.notificationService.notifyTicketAssigned({
        recipientUserId: assigneeUserId,
        ticketId: data.id,
        ticketNumber: data.ticket_number,
        title: data.title,
      });
    }

    return successResponse(data);
  }

  async updateTicket(user, ticketId, payload) {
    const input = parseSchema(UpdateTicketSchema, payload, 'Update ticket');
    const ticket = await this.ticketAccess.getTicketOrThrow(this.db, ticketId);
    const context = await this.ticketAccess.buildAccessContext(this.db, user, ticketId);

    const isOwner = ticket.requester_id === user.employeeId;
    const canManage = hasPermission(user, 'VIEW_ALL_TICKETS')
      || (hasPermission(user, 'VIEW_DEPARTMENT_TICKETS')
        && ticket.department_id
        && context.userDepartmentId === ticket.department_id);

    if (!isOwner && !canManage) {
      throw AppError.forbidden('You do not have permission to update this ticket');
    }

    const updates = { ...input };
    let priorityActivity = null;

    if (input.priority && input.priority !== ticket.priority) {
      priorityActivity = {
        old: ticket.priority,
        next: input.priority,
      };
    }

    if (input.priority || input.department_id !== undefined || input.category_id !== undefined) {
      const slaInput = {
        department_id: input.department_id ?? ticket.department_id,
        category_id: input.category_id ?? ticket.category_id,
        priority: input.priority ?? ticket.priority,
      };
      const { dueDates } = (await this.slaService.resolveDueDates(slaInput)).data;
      Object.assign(updates, dueDates);
    }

    const { data, error } = await this.db
      .from('tickets')
      .update(updates)
      .eq('id', ticketId)
      .select()
      .single();

    if (error) {
      throw AppError.internal('Unable to update ticket');
    }

    if (priorityActivity) {
      await this.activityService.logActivity({
        ticketId,
        actorId: user.employeeId,
        activityType: ACTIVITY_TYPES.PRIORITY_CHANGE,
        oldValue: { priority: priorityActivity.old },
        newValue: { priority: priorityActivity.next },
      });
    }

    return successResponse(data);
  }

  async getTicketById(user, ticketId) {
    const ticket = await this.ticketAccess.getTicketOrThrow(this.db, ticketId);
    const context = await this.ticketAccess.buildAccessContext(this.db, user, ticketId);

    if (!canViewTicket(user, ticket, context)) {
      throw AppError.forbidden('You do not have access to this ticket');
    }

    return successResponse(ticket);
  }

  async listTickets(user, query = {}) {
    const filters = parseSchema(TicketListQuerySchema, query, 'Ticket list');
    const context = await this.ticketAccess.buildAccessContext(this.db, user);
    const offset = (filters.page - 1) * filters.limit;

    let dbQuery = this.db
      .from('tickets')
      .select('*', { count: 'exact' });

    if (hasPermission(user, 'VIEW_ALL_TICKETS')) {
      // no scope restriction
    } else if (hasPermission(user, 'VIEW_DEPARTMENT_TICKETS') && context.userDepartmentId) {
      dbQuery = dbQuery.eq('department_id', context.userDepartmentId);
    } else {
      dbQuery = dbQuery.or(
        `requester_id.eq.${user.employeeId},assignee_id.eq.${user.employeeId}`
      );
    }

    if (filters.status) dbQuery = dbQuery.eq('status', filters.status.toUpperCase());
    if (filters.priority) dbQuery = dbQuery.eq('priority', filters.priority);
    if (filters.department_id) dbQuery = dbQuery.eq('department_id', filters.department_id);
    if (filters.assignee_id) dbQuery = dbQuery.eq('assignee_id', filters.assignee_id);
    if (filters.requester_id) dbQuery = dbQuery.eq('requester_id', filters.requester_id);
    if (filters.search) {
      dbQuery = dbQuery.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    dbQuery = dbQuery
      .order(filters.sort_by, { ascending: filters.sort_order === 'asc' })
      .range(offset, offset + filters.limit - 1);

    const { data, error, count } = await dbQuery;

    if (error) {
      throw AppError.internal('Unable to fetch tickets');
    }

    return successResponse(data || [], {
      page: filters.page,
      limit: filters.limit,
      total: count || 0,
      pages: Math.ceil((count || 0) / filters.limit) || 0,
    });
  }

  async changeStatus(user, ticketId, payload) {
    assertPermission(user, 'CHANGE_TICKET_STATUS');
    const input = parseSchema(ChangeStatusSchema, payload, 'Change status');

    const ticket = await this.ticketAccess.getTicketOrThrow(this.db, ticketId);
    const context = await this.ticketAccess.buildAccessContext(this.db, user, ticketId);

    const isRequester = ticket.requester_id === user.employeeId;
    const isAssignee = ticket.assignee_id === user.employeeId;
    const isElevated = hasPermission(user, 'VIEW_ALL_TICKETS')
      || (hasPermission(user, 'VIEW_DEPARTMENT_TICKETS')
        && ticket.department_id
        && context.userDepartmentId === ticket.department_id);

    if (!isElevated && !isAssignee && !(isRequester && ['CANCELLED', 'PENDING_USER'].includes(input.status.toUpperCase()))) {
      throw AppError.forbidden('You do not have permission to change ticket status');
    }

    const nextStatus = validateStatusTransition(ticket.status, input.status);
    const updates = { status: nextStatus };

    if (input.resolution_notes !== undefined) {
      updates.resolution_notes = input.resolution_notes;
    }

    if (nextStatus === 'RESOLVED') {
      updates.resolved_at = new Date().toISOString();
      updates.resolution_notes = input.resolution_notes || ticket.resolution_notes;
    }

    if (nextStatus === 'CLOSED') {
      updates.closed_at = new Date().toISOString();
    }

    if (nextStatus === 'REOPENED') {
      updates.resolved_at = null;
      updates.closed_at = null;
    }

    const { data, error } = await this.db
      .from('tickets')
      .update(updates)
      .eq('id', ticketId)
      .select()
      .single();

    if (error) {
      throw AppError.internal('Unable to change ticket status');
    }

    const activityType = nextStatus === 'RESOLVED'
      ? ACTIVITY_TYPES.RESOLUTION
      : nextStatus === 'CLOSED'
        ? ACTIVITY_TYPES.CLOSURE
        : nextStatus === 'REOPENED'
          ? ACTIVITY_TYPES.REOPEN
          : nextStatus === 'ESCALATED'
            ? ACTIVITY_TYPES.ESCALATION
            : ACTIVITY_TYPES.STATUS_CHANGE;

    await this.activityService.logActivity({
      ticketId,
      actorId: user.employeeId,
      activityType,
      oldValue: { status: ticket.status },
      newValue: { status: nextStatus },
    });

    if (ticket.requester_id) {
      const requesterUserId = await this.ticketAccess.getEmployeeUserId(this.db, ticket.requester_id);
      if (nextStatus === 'CLOSED') {
        await this.notificationService.notifyTicketClosed({
          recipientUserId: requesterUserId,
          ticketId,
          ticketNumber: data.ticket_number,
        });
      } else if (nextStatus === 'REOPENED') {
        await this.notificationService.notifyTicketReopened({
          recipientUserId: requesterUserId,
          ticketId,
          ticketNumber: data.ticket_number,
        });
      } else if (nextStatus === 'ESCALATED') {
        await this.notificationService.notifyTicketEscalated({
          recipientUserId: requesterUserId,
          ticketId,
          ticketNumber: data.ticket_number,
        });
      } else {
        await this.notificationService.notifyTicketStatusChanged({
          recipientUserId: requesterUserId,
          ticketId,
          ticketNumber: data.ticket_number,
          status: nextStatus,
        });
      }
    }

    if (ticket.assignee_id && ticket.assignee_id !== ticket.requester_id) {
      const assigneeUserId = await this.ticketAccess.getEmployeeUserId(this.db, ticket.assignee_id);
      if (nextStatus === 'CLOSED') {
        await this.notificationService.notifyTicketClosed({
          recipientUserId: assigneeUserId,
          ticketId,
          ticketNumber: data.ticket_number,
        });
      } else if (nextStatus !== ticket.status) {
        await this.notificationService.notifyTicketStatusChanged({
          recipientUserId: assigneeUserId,
          ticketId,
          ticketNumber: data.ticket_number,
          status: nextStatus,
        });
      }
    }

    const { logTicketingEvent } = require('../lib/ticketing-logger');
    logTicketingEvent(
      nextStatus === 'CLOSED' ? 'ticket_closed' : nextStatus === 'REOPENED' ? 'ticket_reopened' : 'ticket_status_changed',
      { ticketId, status: nextStatus }
    );

    return successResponse(data);
  }

  async closeTicket(user, ticketId, payload = {}) {
    assertPermission(user, 'CLOSE_TICKET');
    return this.changeStatus(user, ticketId, {
      status: 'CLOSED',
      resolution_notes: payload.resolution_notes,
    });
  }

  async reopenTicket(user, ticketId) {
    assertPermission(user, 'REOPEN_TICKET');
    return this.changeStatus(user, ticketId, { status: 'REOPENED' });
  }
}

module.exports = TicketService;
