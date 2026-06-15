const AppError = require('../../../utils/app-error');
const {
  ACTIVITY_TYPES,
  assertPermission,
  canViewTicket,
  successResponse,
} = require('../ticketing.types');
const { AddWatcherSchema, parseSchema } = require('../validators/ticketing.validator');

function handleDbError(error, notFoundMessage = 'Watcher not found') {
  if (!error) return;
  if (error.code === 'PGRST116') {
    throw AppError.notFound(notFoundMessage);
  }
  if (error.code === '23505') {
    throw AppError.conflict('Employee is already watching this ticket');
  }
  throw AppError.internal('Unable to complete the requested operation');
}

class WatcherService {
  constructor(deps = {}) {
    this.db = deps.supabaseAdmin || require('@lib/supabase').supabaseAdmin;
    const sharedDeps = { ...deps, supabaseAdmin: this.db };
    this.activityService = deps.activityService || new (require('./activity.service'))(sharedDeps);
    this.ticketAccess = deps.ticketAccess || require('./ticket-access.helper');
  }

  async addWatcher(user, ticketId, payload = {}) {
    assertPermission(user, 'MANAGE_WATCHERS');
    const input = parseSchema(AddWatcherSchema, payload, 'Add watcher');

    const ticket = await this.ticketAccess.getTicketOrThrow(this.db, ticketId);
    const context = await this.ticketAccess.buildAccessContext(this.db, user);
    if (!canViewTicket(user, ticket, context)) {
      throw AppError.forbidden('You do not have access to this ticket');
    }

    const employeeId = input.employee_id || user.employeeId;
    if (!employeeId) {
      throw AppError.badRequest('Employee ID is required');
    }

    const { data, error } = await this.db
      .from('ticket_watchers')
      .insert([{ ticket_id: ticketId, employee_id: employeeId }])
      .select()
      .single();

    handleDbError(error);

    await this.activityService.logActivity({
      ticketId,
      actorId: user.employeeId,
      activityType: ACTIVITY_TYPES.WATCHER_ADDED,
      newValue: { employee_id: employeeId },
    });

    return successResponse(data);
  }

  async removeWatcher(user, ticketId, employeeId = null) {
    assertPermission(user, 'MANAGE_WATCHERS');

    const ticket = await this.ticketAccess.getTicketOrThrow(this.db, ticketId);
    const context = await this.ticketAccess.buildAccessContext(this.db, user);
    if (!canViewTicket(user, ticket, context)) {
      throw AppError.forbidden('You do not have access to this ticket');
    }

    const targetEmployeeId = employeeId || user.employeeId;
    if (!targetEmployeeId) {
      throw AppError.badRequest('Employee ID is required');
    }

    if (
      targetEmployeeId !== user.employeeId
      && !['ADMIN', 'HR', 'MANAGER'].includes(String(user.role || '').toUpperCase())
    ) {
      throw AppError.forbidden('You can only remove yourself as a watcher');
    }

    const { data, error } = await this.db
      .from('ticket_watchers')
      .delete()
      .eq('ticket_id', ticketId)
      .eq('employee_id', targetEmployeeId)
      .select()
      .maybeSingle();

    handleDbError(error, 'Watcher not found');
    if (!data) {
      throw AppError.notFound('Watcher not found');
    }

    await this.activityService.logActivity({
      ticketId,
      actorId: user.employeeId,
      activityType: ACTIVITY_TYPES.WATCHER_REMOVED,
      oldValue: { employee_id: targetEmployeeId },
    });

    return successResponse(data);
  }

  async listWatchers(user, ticketId) {
    const ticket = await this.ticketAccess.getTicketOrThrow(this.db, ticketId);
    const context = await this.ticketAccess.buildAccessContext(this.db, user, ticketId);
    if (!canViewTicket(user, ticket, context)) {
      throw AppError.forbidden('You do not have access to this ticket');
    }

    const { data, error } = await this.db
      .from('ticket_watchers')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    handleDbError(error);
    return successResponse(data || []);
  }
}

module.exports = WatcherService;
