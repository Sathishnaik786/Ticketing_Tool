const AppError = require('../../utils/app-error');

const ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  HR: 'HR',
  MANAGER: 'MANAGER',
  EMPLOYEE: 'EMPLOYEE',
});

const TICKET_STATUSES = Object.freeze([
  'OPEN',
  'ASSIGNED',
  'IN_PROGRESS',
  'PENDING_USER',
  'RESOLVED',
  'CLOSED',
  'REJECTED',
  'CANCELLED',
  'REOPENED',
  'ESCALATED',
]);

const TICKET_PRIORITIES = Object.freeze(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

const ACTIVITY_TYPES = Object.freeze({
  CREATED: 'CREATED',
  STATUS_CHANGE: 'STATUS_CHANGE',
  PRIORITY_CHANGE: 'PRIORITY_CHANGE',
  ASSIGNMENT: 'ASSIGNMENT',
  REASSIGNMENT: 'REASSIGNMENT',
  COMMENT: 'COMMENT',
  ATTACHMENT: 'ATTACHMENT',
  ESCALATION: 'ESCALATION',
  SLA_BREACH: 'SLA_BREACH',
  RESOLUTION: 'RESOLUTION',
  CLOSURE: 'CLOSURE',
  REOPEN: 'REOPEN',
  WATCHER_ADDED: 'WATCHER_ADDED',
  WATCHER_REMOVED: 'WATCHER_REMOVED',
});

const NOTIFICATION_TYPES = Object.freeze({
  TICKET_CREATED: 'TICKET_CREATED',
  TICKET_ASSIGNED: 'TICKET_ASSIGNED',
  TICKET_UPDATED: 'TICKET_UPDATED',
  TICKET_COMMENT: 'TICKET_COMMENT',
  TICKET_ESCALATED: 'TICKET_ESCALATED',
});

const PERMISSIONS = Object.freeze({
  CREATE_TICKET: [ROLES.ADMIN, ROLES.HR, ROLES.MANAGER, ROLES.EMPLOYEE],
  UPDATE_OWN_TICKET: [ROLES.ADMIN, ROLES.HR, ROLES.MANAGER, ROLES.EMPLOYEE],
  VIEW_ALL_TICKETS: [ROLES.ADMIN, ROLES.HR],
  VIEW_DEPARTMENT_TICKETS: [ROLES.ADMIN, ROLES.HR, ROLES.MANAGER],
  ASSIGN_TICKET: [ROLES.ADMIN, ROLES.HR, ROLES.MANAGER],
  CHANGE_TICKET_STATUS: [ROLES.ADMIN, ROLES.HR, ROLES.MANAGER, ROLES.EMPLOYEE],
  ADD_PUBLIC_COMMENT: [ROLES.ADMIN, ROLES.HR, ROLES.MANAGER, ROLES.EMPLOYEE],
  ADD_INTERNAL_COMMENT: [ROLES.ADMIN, ROLES.HR, ROLES.MANAGER],
  UPLOAD_ATTACHMENT: [ROLES.ADMIN, ROLES.HR, ROLES.MANAGER, ROLES.EMPLOYEE],
  MANAGE_WATCHERS: [ROLES.ADMIN, ROLES.HR, ROLES.MANAGER, ROLES.EMPLOYEE],
  MANAGE_SLA: [ROLES.ADMIN, ROLES.HR],
  CLOSE_TICKET: [ROLES.ADMIN, ROLES.HR, ROLES.MANAGER, ROLES.EMPLOYEE],
  REOPEN_TICKET: [ROLES.ADMIN, ROLES.HR, ROLES.MANAGER, ROLES.EMPLOYEE],
});

const STATUS_TRANSITIONS = Object.freeze({
  OPEN: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['IN_PROGRESS', 'REOPENED'],
  IN_PROGRESS: ['PENDING_USER', 'RESOLVED', 'ESCALATED'],
  PENDING_USER: ['IN_PROGRESS', 'RESOLVED'],
  RESOLVED: ['CLOSED', 'REOPENED'],
  CLOSED: [],
  REJECTED: [],
  CANCELLED: [],
  REOPENED: ['ASSIGNED'],
  ESCALATED: ['IN_PROGRESS', 'RESOLVED'],
});

const ATTACHMENT_BUCKET = 'ticket-attachments';
const MAX_ATTACHMENT_SIZE_BYTES = 4 * 1024 * 1024;

const ALLOWED_ATTACHMENT_MIME_TYPES = Object.freeze([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
  'application/zip',
  'application/x-zip-compressed',
]);

const BLOCKED_ATTACHMENT_EXTENSIONS = Object.freeze([
  '.exe', '.bat', '.cmd', '.sh', '.ps1', '.apk',
]);

function normalizeRole(role) {
  return String(role || ROLES.EMPLOYEE).toUpperCase();
}

function hasPermission(user, permission) {
  const role = normalizeRole(user?.role);
  const allowed = PERMISSIONS[permission] || [];
  return allowed.includes(role);
}

function assertPermission(user, permission, message = 'Access denied') {
  if (!hasPermission(user, permission)) {
    throw AppError.forbidden(message);
  }
}

function validateStatusTransition(currentStatus, nextStatus) {
  const from = String(currentStatus || '').toUpperCase();
  const to = String(nextStatus || '').toUpperCase();

  if (from === to) {
    return to;
  }

  const allowed = STATUS_TRANSITIONS[from];
  if (!allowed || !allowed.includes(to)) {
    throw AppError.badRequest(`Invalid status transition from ${from} to ${to}`);
  }

  return to;
}

function canViewTicket(user, ticket, context = {}) {
  if (!user || !ticket) return false;

  const role = normalizeRole(user.role);

  if (hasPermission({ role }, 'VIEW_ALL_TICKETS')) {
    return true;
  }

  if (user.employeeId && ticket.requester_id === user.employeeId) {
    return true;
  }

  if (user.employeeId && ticket.assignee_id === user.employeeId) {
    return true;
  }

  if (context.isWatcher) {
    return true;
  }

  if (
    role === ROLES.MANAGER
    && ticket.department_id
    && context.userDepartmentId
    && ticket.department_id === context.userDepartmentId
  ) {
    return true;
  }

  return false;
}

function canManageTicket(user, ticket, context = {}) {
  if (!user || !ticket) return false;

  if (hasPermission(user, 'VIEW_ALL_TICKETS')) {
    return true;
  }

  if (user.employeeId && ticket.assignee_id === user.employeeId) {
    return true;
  }

  if (
    hasPermission(user, 'VIEW_DEPARTMENT_TICKETS')
    && ticket.department_id
    && context.userDepartmentId
    && ticket.department_id === context.userDepartmentId
  ) {
    return true;
  }

  return false;
}

function canAssignTicket(user, ticket, context = {}) {
  if (!hasPermission(user, 'ASSIGN_TICKET')) {
    return false;
  }

  if (hasPermission(user, 'VIEW_ALL_TICKETS')) {
    return true;
  }

  return (
    ticket.department_id
    && context.userDepartmentId
    && ticket.department_id === context.userDepartmentId
  );
}

function canAddInternalComment(user, ticket, context = {}) {
  if (hasPermission(user, 'VIEW_ALL_TICKETS')) {
    return true;
  }

  if (user.employeeId && ticket.assignee_id === user.employeeId) {
    return true;
  }

  if (
    hasPermission(user, 'VIEW_DEPARTMENT_TICKETS')
    && ticket.department_id
    && context.userDepartmentId
    && ticket.department_id === context.userDepartmentId
  ) {
    return true;
  }

  return false;
}

function sanitizeFileName(fileName) {
  return String(fileName || 'file')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .slice(0, 200);
}

function buildAttachmentPath(ticketId, fileName) {
  const { randomUUID } = require('crypto');
  const safeName = sanitizeFileName(fileName);
  return `tickets/${ticketId}/${randomUUID()}-${safeName}`;
}

function isBlockedAttachment(fileName, mimeType) {
  const lower = String(fileName || '').toLowerCase();
  if (BLOCKED_ATTACHMENT_EXTENSIONS.some((ext) => lower.endsWith(ext))) {
    return true;
  }
  const blockedMimes = [
    'application/x-msdownload',
    'application/x-sh',
    'application/x-bat',
    'application/vnd.android.package-archive',
  ];
  return blockedMimes.includes(String(mimeType || '').toLowerCase());
}

function successResponse(data, meta = null) {
  const response = { success: true, data };
  if (meta) {
    response.meta = meta;
  }
  return response;
}

module.exports = {
  ROLES,
  TICKET_STATUSES,
  TICKET_PRIORITIES,
  ACTIVITY_TYPES,
  NOTIFICATION_TYPES,
  PERMISSIONS,
  STATUS_TRANSITIONS,
  ATTACHMENT_BUCKET,
  MAX_ATTACHMENT_SIZE_BYTES,
  ALLOWED_ATTACHMENT_MIME_TYPES,
  BLOCKED_ATTACHMENT_EXTENSIONS,
  normalizeRole,
  hasPermission,
  assertPermission,
  validateStatusTransition,
  canViewTicket,
  canManageTicket,
  canAssignTicket,
  canAddInternalComment,
  sanitizeFileName,
  buildAttachmentPath,
  isBlockedAttachment,
  successResponse,
};
