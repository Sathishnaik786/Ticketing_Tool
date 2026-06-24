const test = require('node:test');
const assert = require('node:assert/strict');
const {
  parseSchema,
  NotificationFilterSchema,
  PreferencesSchema,
  TemplateSchema,
  TemplateUpdateSchema,
  AnalyticsFilterSchema,
  EVENT_TYPES,
} = require('../validators/notification-center.validation');
const AppError = require('../../../utils/app-error');

test('NotificationFilterSchema accepts empty', () => {
  const r = parseSchema(NotificationFilterSchema, {}, 'Filters');
  assert.equal(r.status, 'all');
});

test('NotificationFilterSchema accepts unread status', () => {
  const r = parseSchema(NotificationFilterSchema, { status: 'unread' }, 'Filters');
  assert.equal(r.status, 'unread');
});

test('NotificationFilterSchema accepts priority', () => {
  const r = parseSchema(NotificationFilterSchema, { priority: 'HIGH' }, 'Filters');
  assert.equal(r.priority, 'HIGH');
});

test('PreferencesSchema accepts partial', () => {
  const r = parseSchema(PreferencesSchema, { email_enabled: false }, 'Preferences');
  assert.equal(r.email_enabled, false);
});

test('TemplateSchema accepts valid template', () => {
  const r = parseSchema(TemplateSchema, {
    code: 'TEST',
    name: 'Test',
    type: 'TICKET',
    subject: 'Sub',
    message_template: 'Hello',
  }, 'Template');
  assert.equal(r.code, 'TEST');
});

test('TemplateSchema rejects empty name', () => {
  assert.throws(
    () => parseSchema(TemplateSchema, { code: 'X', name: '', type: 'T', subject: 'S', message_template: 'M' }, 'Template'),
    (e) => e instanceof AppError && e.statusCode === 400
  );
});

test('TemplateUpdateSchema allows partial', () => {
  const r = parseSchema(TemplateUpdateSchema, { name: 'Updated' }, 'Template');
  assert.equal(r.name, 'Updated');
});

test('AnalyticsFilterSchema accepts date range', () => {
  const r = parseSchema(AnalyticsFilterSchema, {
    from: '2026-01-01T00:00:00.000Z',
    to: '2026-06-01T00:00:00.000Z',
  }, 'Analytics filters');
  assert.ok(r.from);
});

test('EVENT_TYPES includes TICKET_CREATED', () => {
  assert.ok(EVENT_TYPES.includes('TICKET_CREATED'));
});

test('EVENT_TYPES includes REPORT_GENERATED', () => {
  assert.ok(EVENT_TYPES.includes('REPORT_GENERATED'));
});

test('NotificationFilterSchema accepts source_module', () => {
  const r = parseSchema(NotificationFilterSchema, { source_module: 'ticketing' }, 'Filters');
  assert.equal(r.source_module, 'ticketing');
});

test('NotificationFilterSchema accepts search', () => {
  const r = parseSchema(NotificationFilterSchema, { search: 'sla' }, 'Filters');
  assert.equal(r.search, 'sla');
});

test('PreferencesSchema accepts all channels', () => {
  const r = parseSchema(PreferencesSchema, {
    email_enabled: true,
    in_app_enabled: true,
    sms_enabled: false,
    push_enabled: true,
  }, 'Preferences');
  assert.equal(r.push_enabled, true);
});

test('TemplateSchema defaults is_active true', () => {
  const r = parseSchema(TemplateSchema, {
    code: 'A', name: 'N', type: 'T', subject: 'S', message_template: 'M',
  }, 'Template');
  assert.equal(r.is_active, true);
});

test('AnalyticsFilterSchema accepts department_id', () => {
  const r = parseSchema(AnalyticsFilterSchema, {
    department_id: '550e8400-e29b-41d4-a716-446655440001',
  }, 'Analytics filters');
  assert.ok(r.department_id);
});
