const AppError = require('../../../utils/app-error');
const { canViewTicket, canManageTicket } = require('../ticketing.types');

function handleDbError(error, notFoundMessage = 'Ticket not found') {
  if (!error) return;
  if (error.code === 'PGRST116') {
    throw AppError.notFound(notFoundMessage);
  }
  throw AppError.internal('Unable to complete the requested operation');
}

async function getTicketOrThrow(db, ticketId) {
  const { data, error } = await db
    .from('tickets')
    .select('*')
    .eq('id', ticketId)
    .single();

  handleDbError(error, 'Ticket not found');
  return data;
}

async function getEmployeeDepartmentId(db, employeeId) {
  if (!employeeId) return null;

  const { data, error } = await db
    .from('employees')
    .select('department_id')
    .eq('id', employeeId)
    .maybeSingle();

  handleDbError(error);
  return data?.department_id || null;
}

async function isTicketWatcher(db, ticketId, employeeId) {
  if (!employeeId) return false;

  const { data, error } = await db
    .from('ticket_watchers')
    .select('id')
    .eq('ticket_id', ticketId)
    .eq('employee_id', employeeId)
    .maybeSingle();

  handleDbError(error);
  return Boolean(data);
}

async function buildAccessContext(db, user, ticketId = null) {
  const userDepartmentId = await getEmployeeDepartmentId(db, user.employeeId);
  let isWatcher = false;

  if (ticketId && user.employeeId) {
    isWatcher = await isTicketWatcher(db, ticketId, user.employeeId);
  }

  return { userDepartmentId, isWatcher };
}

async function assertCanView(db, user, ticket) {
  const context = await buildAccessContext(db, user, ticket.id);
  if (!canViewTicket(user, ticket, context)) {
    throw AppError.forbidden('You do not have access to this ticket');
  }
  return context;
}

async function assertCanManage(db, user, ticket) {
  const context = await assertCanView(db, user, ticket);
  if (!canManageTicket(user, ticket, context) && ticket.requester_id !== user.employeeId) {
    throw AppError.forbidden('You do not have permission to manage this ticket');
  }
  return context;
}

async function getEmployeeUserId(db, employeeId) {
  const { data, error } = await db
    .from('employees')
    .select('user_id')
    .eq('id', employeeId)
    .maybeSingle();

  handleDbError(error, 'Employee not found');
  if (!data?.user_id) {
    throw AppError.notFound('Employee user mapping not found');
  }
  return data.user_id;
}

module.exports = {
  getTicketOrThrow,
  getEmployeeDepartmentId,
  isTicketWatcher,
  buildAccessContext,
  assertCanView,
  assertCanManage,
  getEmployeeUserId,
  handleDbError,
};
