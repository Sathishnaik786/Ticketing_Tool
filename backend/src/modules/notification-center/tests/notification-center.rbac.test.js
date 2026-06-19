const test = require('node:test');
const assert = require('node:assert/strict');
const NotificationCenterService = require('../services/notification-center.service');
const AppError = require('../../../utils/app-error');
const { ANALYTICS_ROLES, TEMPLATE_ADMIN_ROLES } = require('../notification-center.constants');

const EMP_ID = '550e8400-e29b-41d4-a716-446655440010';

test('ANALYTICS_ROLES includes MANAGER', () => {
  assert.ok(ANALYTICS_ROLES.includes('MANAGER'));
});

test('TEMPLATE_ADMIN_ROLES includes ADMIN', () => {
  assert.ok(TEMPLATE_ADMIN_ROLES.includes('ADMIN'));
});

test('employee can access own notifications', async () => {
  const repo = {
    listEvents: async () => [{ id: 'n1' }],
    countUnread: async () => 1,
    getPreferences: async () => null,
    upsertPreferences: async () => ({}),
    findEventByDedup: async () => null,
    createEvent: async () => null,
    fetchTimelineEvents: async () => [],
    fetchApprovals: async () => [],
    fetchFeedback: async () => [],
    fetchPublishedArticles: async () => [],
    fetchReports: async () => [],
  };
  const s = new NotificationCenterService({ repository: repo });
  const r = await s.getMyNotifications({ role: 'EMPLOYEE', employeeId: EMP_ID }, {});
  assert.equal(r.success, true);
});

test('employee denied analytics', async () => {
  const s = new NotificationCenterService({ repository: {} });
  await assert.rejects(
    () => s.getAnalytics({ role: 'EMPLOYEE', employeeId: EMP_ID }, {}),
    (e) => e instanceof AppError && e.statusCode === 403
  );
});

test('manager can access analytics', async () => {
  const repo = {
    fetchEventsForAnalytics: async () => [],
    fetchDeliveryLogs: async () => [],
  };
  const s = new NotificationCenterService({ repository: repo });
  const r = await s.getAnalytics({ role: 'MANAGER', employeeId: EMP_ID }, {});
  assert.equal(r.success, true);
});

test('employee denied template list', async () => {
  const s = new NotificationCenterService({ repository: {} });
  await assert.rejects(
    () => s.listTemplates({ role: 'EMPLOYEE', employeeId: EMP_ID }),
    (e) => e instanceof AppError && e.statusCode === 403
  );
});

test('admin can list templates', async () => {
  const repo = { listTemplates: async () => [] };
  const s = new NotificationCenterService({ repository: repo });
  const r = await s.listTemplates({ role: 'ADMIN', employeeId: EMP_ID });
  assert.equal(r.success, true);
});

test('HR can access analytics', async () => {
  const repo = {
    fetchEventsForAnalytics: async () => [{ id: 'e1', is_read: false, source_module: 'ticketing', priority: 'HIGH' }],
    fetchDeliveryLogs: async () => [{ event_id: 'e1', delivery_status: 'SENT' }],
  };
  const s = new NotificationCenterService({ repository: repo });
  const r = await s.getAnalytics({ role: 'HR', employeeId: EMP_ID }, {});
  assert.equal(r.data.total, 1);
});

test('super admin can manage templates', async () => {
  const repo = {
    createTemplate: async (row) => ({ id: 't1', ...row }),
  };
  const s = new NotificationCenterService({ repository: repo });
  const r = await s.createTemplate({ role: 'SUPER_ADMIN', employeeId: EMP_ID }, {
    code: 'X', name: 'N', type: 'T', subject: 'S', message_template: 'M',
  });
  assert.ok(r.data.id);
});

test('manager denied template create', async () => {
  const s = new NotificationCenterService({ repository: {} });
  await assert.rejects(
    () => s.createTemplate({ role: 'MANAGER', employeeId: EMP_ID }, {
      code: 'X', name: 'N', type: 'T', subject: 'S', message_template: 'M',
    }),
    (e) => e instanceof AppError && e.statusCode === 403
  );
});

test('unauthenticated user rejected', async () => {
  const s = new NotificationCenterService({ repository: {} });
  await assert.rejects(
    () => s.getUnreadCount({ role: 'EMPLOYEE' }),
    (e) => e instanceof AppError && e.statusCode === 401
  );
});

test('mark read requires ownership', async () => {
  const repo = { markRead: async () => null };
  const s = new NotificationCenterService({ repository: repo });
  await assert.rejects(
    () => s.markRead({ role: 'EMPLOYEE', employeeId: EMP_ID }, 'missing'),
    (e) => e instanceof AppError && e.statusCode === 404
  );
});
