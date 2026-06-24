const test = require('node:test');
const assert = require('node:assert/strict');
const {
  CreateWorkflowSchema,
  UpdateWorkflowSchema,
  StartApprovalSchema,
  DecisionSchema,
  parseSchema,
} = require('../validation/approval-management.validation');
const AppError = require('../../../utils/app-error');

const WORKFLOW_ID = '550e8400-e29b-41d4-a716-446655440001';
const TICKET_ID = '550e8400-e29b-41d4-a716-446655440002';
const EMP_ID = '550e8400-e29b-41d4-a716-446655440010';

const validStep = {
  step_order: 1,
  step_name: 'Manager Approval',
  approver_role: 'MANAGER',
};

test('CreateWorkflowSchema accepts valid multi-step workflow', () => {
  const result = parseSchema(CreateWorkflowSchema, {
    name: 'Purchase Request',
    approval_type: 'MULTI',
    steps: [validStep, { step_order: 2, step_name: 'Finance', approver_role: 'FINANCE' }],
  });
  assert.equal(result.name, 'Purchase Request');
  assert.equal(result.steps.length, 2);
});

test('CreateWorkflowSchema defaults approval_type to MULTI', () => {
  const result = parseSchema(CreateWorkflowSchema, { name: 'Test', steps: [validStep] });
  assert.equal(result.approval_type, 'MULTI');
});

test('CreateWorkflowSchema defaults is_active true', () => {
  const result = parseSchema(CreateWorkflowSchema, { name: 'Test', steps: [validStep] });
  assert.equal(result.is_active, true);
});

test('CreateWorkflowSchema rejects empty name', () => {
  assert.throws(
    () => parseSchema(CreateWorkflowSchema, { name: '', steps: [validStep] }),
    (err) => err instanceof AppError && err.statusCode === 400
  );
});

test('CreateWorkflowSchema rejects no steps', () => {
  assert.throws(
    () => parseSchema(CreateWorkflowSchema, { name: 'Test', steps: [] }),
    (err) => err instanceof AppError && err.statusCode === 400
  );
});

test('CreateWorkflowSchema rejects invalid approver_role', () => {
  assert.throws(
    () => parseSchema(CreateWorkflowSchema, {
      name: 'Test',
      steps: [{ step_order: 1, step_name: 'X', approver_role: 'INVALID' }],
    }),
    (err) => err instanceof AppError && err.statusCode === 400
  );
});

test('CreateWorkflowSchema accepts SINGLE type', () => {
  const result = parseSchema(CreateWorkflowSchema, {
    name: 'Single',
    approval_type: 'SINGLE',
    steps: [validStep],
  });
  assert.equal(result.approval_type, 'SINGLE');
});

test('CreateWorkflowSchema accepts optional service_item_id', () => {
  const itemId = '550e8400-e29b-41d4-a716-446655440099';
  const result = parseSchema(CreateWorkflowSchema, {
    name: 'Test',
    service_item_id: itemId,
    steps: [validStep],
  });
  assert.equal(result.service_item_id, itemId);
});

test('CreateWorkflowSchema accepts optional description', () => {
  const result = parseSchema(CreateWorkflowSchema, {
    name: 'Test',
    description: 'Aparna Enterprises workflow',
    steps: [validStep],
  });
  assert.equal(result.description, 'Aparna Enterprises workflow');
});

test('UpdateWorkflowSchema allows partial update', () => {
  const result = parseSchema(UpdateWorkflowSchema, { name: 'Updated Name' });
  assert.equal(result.name, 'Updated Name');
});

test('UpdateWorkflowSchema allows steps optional', () => {
  const result = parseSchema(UpdateWorkflowSchema, { is_active: false });
  assert.equal(result.is_active, false);
});

test('StartApprovalSchema accepts valid payload', () => {
  const result = parseSchema(StartApprovalSchema, { workflow_id: WORKFLOW_ID });
  assert.equal(result.workflow_id, WORKFLOW_ID);
});

test('StartApprovalSchema accepts optional comments', () => {
  const result = parseSchema(StartApprovalSchema, {
    workflow_id: WORKFLOW_ID,
    comments: 'Please approve',
  });
  assert.equal(result.comments, 'Please approve');
});

test('StartApprovalSchema rejects invalid workflow_id', () => {
  assert.throws(
    () => parseSchema(StartApprovalSchema, { workflow_id: 'bad' }),
    (err) => err instanceof AppError && err.statusCode === 400
  );
});

test('DecisionSchema accepts empty body', () => {
  const result = parseSchema(DecisionSchema, {});
  assert.equal(result.comments, undefined);
});

test('DecisionSchema accepts comments', () => {
  const result = parseSchema(DecisionSchema, { comments: 'Approved with conditions' });
  assert.equal(result.comments, 'Approved with conditions');
});

test('CreateWorkflowSchema step requires step_order >= 1', () => {
  assert.throws(
    () => parseSchema(CreateWorkflowSchema, {
      name: 'Test',
      steps: [{ step_order: 0, step_name: 'X', approver_role: 'MANAGER' }],
    }),
    (err) => err instanceof AppError && err.statusCode === 400
  );
});

test('CreateWorkflowSchema accepts HR approver role', () => {
  const result = parseSchema(CreateWorkflowSchema, {
    name: 'HR Flow',
    steps: [{ step_order: 1, step_name: 'HR Review', approver_role: 'HR' }],
  });
  assert.equal(result.steps[0].approver_role, 'HR');
});

test('CreateWorkflowSchema accepts escalation_hours', () => {
  const result = parseSchema(CreateWorkflowSchema, {
    name: 'Escalation',
    steps: [{ ...validStep, escalation_hours: 24 }],
  });
  assert.equal(result.steps[0].escalation_hours, 24);
});

test('StartApprovalSchema rejects missing workflow_id', () => {
  assert.throws(
    () => parseSchema(StartApprovalSchema, {}),
    (err) => err instanceof AppError && err.statusCode === 400
  );
});
