const test = require('node:test');
const assert = require('node:assert/strict');
const ExecutiveAnalyticsService = require('../services/executive-analytics.service');
const AppError = require('../../../utils/app-error');
const { ENTERPRISE_ROLES, DEPARTMENT_ROLES } = require('../executive-analytics.constants');

test('ENTERPRISE_ROLES includes HR ADMIN SUPER_ADMIN', () => {
  assert.ok(ENTERPRISE_ROLES.includes('HR'));
  assert.ok(ENTERPRISE_ROLES.includes('ADMIN'));
  assert.ok(ENTERPRISE_ROLES.includes('SUPER_ADMIN'));
});

test('DEPARTMENT_ROLES includes MANAGER', () => {
  assert.ok(DEPARTMENT_ROLES.includes('MANAGER'));
});

test('employee has no analytics access', async () => {
  const s = new ExecutiveAnalyticsService({ repository: {} });
  await assert.rejects(
    () => s.getTrendAnalytics({ role: 'EMPLOYEE', employeeId: 'e1' }),
    (e) => e instanceof AppError && e.statusCode === 403
  );
});

test('manager has department access', () => {
  const s = new ExecutiveAnalyticsService({ repository: {} });
  assert.doesNotThrow(() => s.assertDepartmentAccess({ role: 'MANAGER' }));
});

test('manager lacks enterprise access', () => {
  const s = new ExecutiveAnalyticsService({ repository: {} });
  assert.throws(
    () => s.assertEnterpriseAccess({ role: 'MANAGER' }),
    (e) => e instanceof AppError && e.statusCode === 403
  );
});

test('HR has enterprise access', () => {
  const s = new ExecutiveAnalyticsService({ repository: {} });
  assert.doesNotThrow(() => s.assertEnterpriseAccess({ role: 'HR' }));
});

test('admin has enterprise access', () => {
  const s = new ExecutiveAnalyticsService({ repository: {} });
  assert.doesNotThrow(() => s.assertEnterpriseAccess({ role: 'ADMIN' }));
});

test('finance lacks enterprise access', () => {
  const s = new ExecutiveAnalyticsService({ repository: {} });
  assert.throws(
    () => s.assertEnterpriseAccess({ role: 'FINANCE' }),
    (e) => e instanceof AppError && e.statusCode === 403
  );
});

test('employee denied sla analytics', async () => {
  const s = new ExecutiveAnalyticsService({ repository: {} });
  await assert.rejects(
    () => s.getSlaAnalytics({ role: 'EMPLOYEE', employeeId: 'e1' }),
    (e) => e instanceof AppError && e.statusCode === 403
  );
});

test('manager can access sla', async () => {
  const s = new ExecutiveAnalyticsService({
    repository: {
      fetchTickets: async () => [],
      fetchFeedback: async () => [],
      fetchApprovals: async () => [],
      fetchEscalations: async () => [],
      fetchKnowledgeViews: async () => [],
      fetchDepartments: async () => [],
    },
  });
  const r = await s.getSlaAnalytics({ role: 'MANAGER', employeeId: 'm1' });
  assert.equal(r.success, true);
});

test('super admin has full enterprise access', () => {
  assert.ok(ENTERPRISE_ROLES.includes('SUPER_ADMIN'));
});

test('HR can access knowledge analytics', async () => {
  const s = new ExecutiveAnalyticsService({
    repository: {
      fetchKnowledgeViews: async () => [],
      fetchKnowledgeArticles: async () => [],
    },
  });
  const r = await s.getKnowledgeAnalytics({ role: 'HR', employeeId: 'h1' });
  assert.equal(r.success, true);
});
