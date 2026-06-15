const AppError = require('../../../utils/app-error');
const {
  ACTIVITY_TYPES,
  assertPermission,
  canAddInternalComment,
  canViewTicket,
  successResponse,
} = require('../ticketing.types');
const { CreateCommentSchema, parseSchema } = require('../validators/ticketing.validator');

class CommentService {
  constructor(deps = {}) {
    this.db = deps.supabaseAdmin || require('@lib/supabase').supabaseAdmin;
    const sharedDeps = { ...deps, supabaseAdmin: this.db };
    this.activityService = deps.activityService || new (require('./activity.service'))(sharedDeps);
    this.notificationService = deps.notificationService || new (require('./notification.service'))(sharedDeps);
    this.ticketAccess = deps.ticketAccess || require('./ticket-access.helper');
  }

  async createComment(user, ticketId, payload) {
    assertPermission(user, 'ADD_PUBLIC_COMMENT');
    const input = parseSchema(CreateCommentSchema, payload, 'Create comment');

    const ticket = await this.ticketAccess.getTicketOrThrow(this.db, ticketId);
    const context = await this.ticketAccess.buildAccessContext(this.db, user, ticketId);

    if (!canViewTicket(user, ticket, context)) {
      throw AppError.forbidden('You do not have access to this ticket');
    }

    if (input.is_internal) {
      assertPermission(user, 'ADD_INTERNAL_COMMENT');
      if (!canAddInternalComment(user, ticket, context)) {
        throw AppError.forbidden('You do not have permission to add internal comments');
      }
    }

    const { data, error } = await this.db
      .from('ticket_comments')
      .insert([{
        ticket_id: ticketId,
        author_id: user.employeeId,
        content: input.content,
        is_internal: input.is_internal,
      }])
      .select()
      .single();

    if (error) {
      throw AppError.internal('Unable to create comment');
    }

    await this.activityService.logActivity({
      ticketId,
      actorId: user.employeeId,
      activityType: ACTIVITY_TYPES.COMMENT,
      newValue: {
        comment_id: data.id,
        is_internal: input.is_internal,
      },
      description: 'Comment added',
    });

    const notifyUserIds = new Set();
    if (!input.is_internal) {
      if (ticket.requester_id && ticket.requester_id !== user.employeeId) {
        const requesterUserId = await this.ticketAccess.getEmployeeUserId(this.db, ticket.requester_id);
        notifyUserIds.add(requesterUserId);
      }
      if (ticket.assignee_id && ticket.assignee_id !== user.employeeId) {
        const assigneeUserId = await this.ticketAccess.getEmployeeUserId(this.db, ticket.assignee_id);
        notifyUserIds.add(assigneeUserId);
      }
    }

    for (const recipientUserId of notifyUserIds) {
      await this.notificationService.notifyTicketComment({
        recipientUserId,
        ticketId,
        ticketNumber: ticket.ticket_number,
      });
    }

    const { logTicketingEvent } = require('../lib/ticketing-logger');
    logTicketingEvent('ticket_commented', {
      ticketId,
      eventType: input.is_internal ? 'internal' : 'public',
    });

    return successResponse(data);
  }

  async listComments(user, ticketId, { includeInternal = false } = {}) {
    const ticket = await this.ticketAccess.getTicketOrThrow(this.db, ticketId);
    const context = await this.ticketAccess.buildAccessContext(this.db, user, ticketId);

    if (!canViewTicket(user, ticket, context)) {
      throw AppError.forbidden('You do not have access to this ticket');
    }

    let query = this.db
      .from('ticket_comments')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    const canSeeInternal = canAddInternalComment(user, ticket, context);
    if (!includeInternal || !canSeeInternal) {
      query = query.eq('is_internal', false);
    }

    const { data, error } = await query;
    if (error) {
      throw AppError.internal('Unable to fetch comments');
    }

    return successResponse(data || []);
  }
}

module.exports = CommentService;
