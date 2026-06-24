const test = require('node:test');
const assert = require('node:assert/strict');
const NotificationCenterService = require('../services/notification-center.service');
const NotificationCenterEventSyncService = require('../services/notification-center-event-sync.service');
const { EVENT_TYPES, TIMELINE_EVENT_MAP } = require('../notification-center.constants');

const EMP_ID = '550e8400-e29b-41d4-a716-446655440010';

function mockRepo(overrides = {}) {
  const base = {
    listEvents: async () => overrides.events ?? [],
    countUnread: async () => overrides.unread ?? 0,
    markRead: async (id) => ({ id, is_read: true }),
    markAllRead: async () => ({ success: true }),
    getPreferences: async () => overrides.prefs ?? { in_app_enabled: true },
    upsertPreferences: async (_, p) => ({ employee_id: EMP_ID, ...p }),
    findEventByDedup: async () => null,
    createEvent: async (row) => ({ id: 'e1', ...row }),
    createDeliveryLog: async (row) => ({ id: 'd1', ...row }),
    fetchTimelineEvents: async () => overrides.timeline ?? [],
    fetchApprovals: async () => overrides.approvals ?? [],
    fetchFeedback: async () => overrides.feedback ?? [],
    fetchPublishedArticles: async () => overrides.articles ?? [],
    fetchReports: async () => overrides.reports ?? [],
    fetchEventsForAnalytics: async () => overrides.analyticsEvents ?? [],
    fetchDeliveryLogs: async () => overrides.deliveries ?? [],
    fetchEmployeesByDepartment: async () => overrides.deptEmployees ?? [],
    listTemplates: async () => [],
    createTemplate: async (r) => ({ id: 't1', ...r }),
    updateTemplate: async (id, r) => ({ id, ...r }),
    deleteTemplate: async () => ({ success: true }),
  };
  return { ...base, ...overrides, ...(overrides.methods || {}) };
}

function svc(repo) {
  return new NotificationCenterService({ repository: repo });
}

test('constants include all event types', () => {
  assert.equal(EVENT_TYPES.length, 17);
});

test('timeline map includes ASSIGNED', () => {
  assert.ok(TIMELINE_EVENT_MAP.ASSIGNED);
});

test('get unread count returns count', async () => {
  const r = await svc(mockRepo({ unread: 5 })).getUnreadCount({ role: 'EMPLOYEE', employeeId: EMP_ID });
  assert.equal(r.data.count, 5);
});

test('get my notifications returns list', async () => {
  const r = await svc(mockRepo({ events: [{ id: 'n1', title: 'Test' }] }))
    .getMyNotifications({ role: 'EMPLOYEE', employeeId: EMP_ID }, { status: 'all' });
  assert.equal(r.data.notifications.length, 1);
});

test('mark read updates notification', async () => {
  const r = await svc(mockRepo()).markRead({ role: 'EMPLOYEE', employeeId: EMP_ID }, 'n1');
  assert.equal(r.data.is_read, true);
});

test('mark all read succeeds', async () => {
  const r = await svc(mockRepo()).markAllRead({ role: 'EMPLOYEE', employeeId: EMP_ID });
  assert.equal(r.data.marked, true);
});

test('get preferences creates defaults', async () => {
  const r = await svc(mockRepo({ prefs: null })).getPreferences({ role: 'EMPLOYEE', employeeId: EMP_ID });
  assert.equal(r.data.in_app_enabled, true);
});

test('update preferences', async () => {
  const r = await svc(mockRepo()).updatePreferences({ role: 'EMPLOYEE', employeeId: EMP_ID }, { sms_enabled: true });
  assert.equal(r.data.sms_enabled, true);
});

test('analytics computes read pct', async () => {
  const r = await svc(mockRepo({
    analyticsEvents: [
      { id: 'e1', is_read: true, source_module: 'ticketing', priority: 'NORMAL' },
      { id: 'e2', is_read: false, source_module: 'sla', priority: 'HIGH' },
    ],
    deliveries: [
      { event_id: 'e1', delivery_status: 'SENT' },
      { event_id: 'e2', delivery_status: 'SENT' },
    ],
  })).getAnalytics({ role: 'ADMIN', employeeId: EMP_ID }, {});
  assert.equal(r.data.total, 2);
  assert.equal(r.data.unread, 1);
  assert.equal(r.data.readPct, 50);
});

test('analytics delivery pct', async () => {
  const r = await svc(mockRepo({
    analyticsEvents: [{ id: 'e1', is_read: false, source_module: 'ticketing', priority: 'NORMAL' }],
    deliveries: [{ event_id: 'e1', delivery_status: 'SENT' }],
  })).getAnalytics({ role: 'HR', employeeId: EMP_ID }, {});
  assert.equal(r.data.deliveryPct, 100);
});

test('delete template', async () => {
  const r = await svc(mockRepo()).deleteTemplate({ role: 'ADMIN', employeeId: EMP_ID }, 't1');
  assert.equal(r.data.deleted, true);
});

test('update template', async () => {
  const r = await svc(mockRepo()).updateTemplate({ role: 'ADMIN', employeeId: EMP_ID }, 't1', { name: 'New' });
  assert.equal(r.data.name, 'New');
});

test('event sync creates from timeline', async () => {
  const repo = mockRepo({
    timeline: [{
      id: 'tl1',
      ticket_id: 'tk1',
      event_type: 'ASSIGNED',
      created_by: EMP_ID,
      event_data: { assignee_id: EMP_ID },
      created_at: new Date().toISOString(),
    }],
  });
  const sync = new NotificationCenterEventSyncService({ repository: repo });
  const created = await sync.syncTimelineEvents(EMP_ID, new Date(0).toISOString());
  assert.equal(created, 1);
});

test('event sync skips duplicate', async () => {
  const repo = mockRepo({
    findEventByDedup: async () => ({ id: 'existing' }),
    timeline: [{
      id: 'tl1', ticket_id: 'tk1', event_type: 'ASSIGNED', created_by: EMP_ID, event_data: {},
    }],
  });
  const sync = new NotificationCenterEventSyncService({ repository: repo });
  const created = await sync.syncTimelineEvents(EMP_ID, new Date(0).toISOString());
  assert.equal(created, 0);
});

test('event sync respects in_app disabled', async () => {
  const repo = mockRepo({
    prefs: { in_app_enabled: false },
    timeline: [{
      id: 'tl1', ticket_id: 'tk1', event_type: 'CLOSED', created_by: EMP_ID, event_data: {},
    }],
  });
  const sync = new NotificationCenterEventSyncService({ repository: repo });
  const created = await sync.syncTimelineEvents(EMP_ID, new Date(0).toISOString());
  assert.equal(created, 0);
});

test('event sync approvals pending', async () => {
  const repo = mockRepo({
    approvals: [{
      id: 'a1', ticket_id: 'tk1', status: 'PENDING', started_by: EMP_ID,
    }],
  });
  const sync = new NotificationCenterEventSyncService({ repository: repo });
  const created = await sync.syncApprovals(EMP_ID, new Date(0).toISOString());
  assert.equal(created, 1);
});

test('event sync knowledge published', async () => {
  const repo = mockRepo({
    articles: [{ id: 'k1', title: 'VPN Guide', author_id: EMP_ID, status: 'PUBLISHED' }],
  });
  const sync = new NotificationCenterEventSyncService({ repository: repo });
  const created = await sync.syncKnowledge(EMP_ID, new Date(0).toISOString());
  assert.equal(created, 1);
});

test('event sync report generated', async () => {
  const repo = mockRepo({
    reports: [{ id: 'r1', name: 'Trend', created_by: EMP_ID }],
  });
  const sync = new NotificationCenterEventSyncService({ repository: repo });
  const created = await sync.syncReports(EMP_ID, new Date(0).toISOString());
  assert.equal(created, 1);
});

test('renderTemplate replaces vars', () => {
  const { renderTemplate } = require('../services/notification-center-event-sync.service');
  const out = renderTemplate('Ticket {{ticket_id}}', { ticket_id: '123' });
  assert.equal(out, 'Ticket 123');
});

test('manager analytics scoped to department', async () => {
  const DEPT = '550e8400-e29b-41d4-a716-446655440001';
  const repo = mockRepo({
    deptEmployees: [{ id: EMP_ID }],
    analyticsEvents: [{ id: 'e1', is_read: false, source_module: 'ticketing', priority: 'NORMAL' }],
    deliveries: [],
  });
  const r = await svc(repo).getAnalytics({ role: 'MANAGER', employeeId: EMP_ID, departmentId: DEPT }, {});
  assert.equal(r.data.total, 1);
});
