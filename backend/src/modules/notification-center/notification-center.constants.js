const EVENT_TYPES = Object.freeze([
  'TICKET_CREATED',
  'TICKET_ASSIGNED',
  'TICKET_REASSIGNED',
  'TICKET_UPDATED',
  'TICKET_RESOLVED',
  'TICKET_CLOSED',
  'SLA_WARNING',
  'SLA_BREACH',
  'APPROVAL_REQUIRED',
  'APPROVAL_APPROVED',
  'APPROVAL_REJECTED',
  'COMMENT_ADDED',
  'EMAIL_RECEIVED',
  'CALL_LOGGED',
  'FEEDBACK_SUBMITTED',
  'KNOWLEDGE_PUBLISHED',
  'REPORT_GENERATED',
]);

const PRIORITIES = Object.freeze(['LOW', 'NORMAL', 'HIGH', 'CRITICAL']);

const SOURCE_MODULES = Object.freeze([
  'ticketing',
  'assignment',
  'sla',
  'communication',
  'approval',
  'feedback',
  'knowledge',
  'analytics',
]);

const DELIVERY_CHANNELS = Object.freeze(['IN_APP', 'EMAIL', 'SMS', 'PUSH']);

const ANALYTICS_ROLES = Object.freeze(['MANAGER', 'HR', 'ADMIN', 'SUPER_ADMIN']);

const TEMPLATE_ADMIN_ROLES = Object.freeze(['ADMIN', 'SUPER_ADMIN']);

const TIMELINE_EVENT_MAP = Object.freeze({
  TICKET_CREATED: { eventType: 'TICKET_CREATED', priority: 'NORMAL', module: 'ticketing' },
  ASSIGNED: { eventType: 'TICKET_ASSIGNED', priority: 'HIGH', module: 'assignment' },
  REASSIGNED: { eventType: 'TICKET_REASSIGNED', priority: 'HIGH', module: 'assignment' },
  STATUS_CHANGED: { eventType: 'TICKET_UPDATED', priority: 'NORMAL', module: 'ticketing' },
  RESOLVED: { eventType: 'TICKET_RESOLVED', priority: 'NORMAL', module: 'ticketing' },
  CLOSED: { eventType: 'TICKET_CLOSED', priority: 'NORMAL', module: 'ticketing' },
  COMMENT_ADDED: { eventType: 'COMMENT_ADDED', priority: 'NORMAL', module: 'communication' },
  EMAIL_RECEIVED: { eventType: 'EMAIL_RECEIVED', priority: 'NORMAL', module: 'communication' },
  CALL_LOGGED: { eventType: 'CALL_LOGGED', priority: 'NORMAL', module: 'communication' },
  FEEDBACK_SUBMITTED: { eventType: 'FEEDBACK_SUBMITTED', priority: 'LOW', module: 'feedback' },
  SLA_WARNING: { eventType: 'SLA_WARNING', priority: 'HIGH', module: 'sla' },
  ESCALATION: { eventType: 'SLA_BREACH', priority: 'CRITICAL', module: 'sla' },
});

module.exports = {
  EVENT_TYPES,
  PRIORITIES,
  SOURCE_MODULES,
  DELIVERY_CHANNELS,
  ANALYTICS_ROLES,
  TEMPLATE_ADMIN_ROLES,
  TIMELINE_EVENT_MAP,
};
