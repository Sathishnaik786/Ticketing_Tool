const test = require('node:test');
const assert = require('node:assert/strict');
const ApprovalManagementService = require('../services/approval-management.service');
const AppError = require('../../../utils/app-error');
const { WORKFLOW_ADMIN_ROLES, APPROVER_ROLES } = require('../approval-management.constants');

test('WORKFLOW_ADMIN_ROLES excludes EMPLOYEE', () => {
  assert.equal(WORKFLOW_ADMIN_ROLES.includes('EMPLOYEE'), false);
});

test('WORKFLOW_ADMIN_ROLES excludes MANAGER', () => {
  assert.equal(WORKFLOW_ADMIN_ROLES.includes('MANAGER'), false);
});

test('APPROVER_ROLES includes all department approvers', () => {
  ['MANAGER', 'HR', 'FINANCE', 'ADMIN'].forEach((role) => {
    assert.ok(APPROVER_ROLES.includes(role));
  });
});

test('employee cannot create workflow', async () => {
  const service = new ApprovalManagementService({
    repository: { createWorkflow: async () => ({}) },
  });
  await assert.rejects(
    () => service.createWorkflow(
      { role: 'EMPLOYEE', employeeId: 'e1' },
      { name: 'X', steps: [{ step_order: 1, step_name: 'M', approver_role: 'MANAGER' }] }
    ),
    (err) => err instanceof AppError && err.statusCode === 403
  );
});

test('manager cannot create workflow', async () => {
  const service = new ApprovalManagementService({ repository: {} });
  await assert.rejects(
    () => service.createWorkflow(
      { role: 'MANAGER', employeeId: 'm1' },
      { name: 'X', steps: [{ step_order: 1, step_name: 'M', approver_role: 'MANAGER' }] }
    ),
    (err) => err instanceof AppError && err.statusCode === 403
  );
});

test('HR cannot create workflow', async () => {
  const service = new ApprovalManagementService({ repository: {} });
  await assert.rejects(
    () => service.createWorkflow(
      { role: 'HR', employeeId: 'h1' },
      { name: 'X', steps: [{ step_order: 1, step_name: 'H', approver_role: 'HR' }] }
    ),
    (err) => err instanceof AppError && err.statusCode === 403
  );
});

test('finance cannot access analytics', async () => {
  const service = new ApprovalManagementService({ repository: {} });
  await assert.rejects(
    () => service.getAnalytics({ role: 'FINANCE', employeeId: 'f1' }),
    (err) => err instanceof AppError && err.statusCode === 403
  );
});

test('employee can track own approvals via getMyApprovals contract', () => {
  const service = new ApprovalManagementService({
    repository: { listMyApprovals: async () => [] },
  });
  assert.equal(typeof service.getMyApprovals, 'function');
});

test('manager can access analytics', async () => {
  const service = new ApprovalManagementService({
    repository: {
      countApprovalsByStatus: async () => ({}),
      listPendingApprovals: async () => [],
    },
  });
  const result = await service.getAnalytics({ role: 'MANAGER', employeeId: 'm1' });
  assert.equal(result.success, true);
});

test('super admin has workflow admin privileges', () => {
  assert.ok(WORKFLOW_ADMIN_ROLES.includes('SUPER_ADMIN'));
});
