const test = require('node:test');
const assert = require('node:assert/strict');
const ApprovalManagementService = require('../services/approval-management.service');
const AppError = require('../../../utils/app-error');
const { createMockSupabase } = require('../../ticketing/tests/helpers/mock-supabase');
const {
  APPROVAL_STATUSES,
  APPROVAL_TYPES,
  CATALOG_CATEGORIES,
  WORKFLOW_ADMIN_ROLES,
  APPROVER_ROLES,
} = require('../approval-management.constants');

const TICKET_ID = '550e8400-e29b-41d4-a716-446655440001';
const WORKFLOW_ID = '550e8400-e29b-41d4-a716-446655440002';
const STEP1_ID = '550e8400-e29b-41d4-a716-446655440003';
const STEP2_ID = '550e8400-e29b-41d4-a716-446655440004';
const APPROVAL_ID = '550e8400-e29b-41d4-a716-446655440005';
const EMPLOYEE_ID = '550e8400-e29b-41d4-a716-446655440010';
const MANAGER_ID = '550e8400-e29b-41d4-a716-446655440011';
const FINANCE_ID = '550e8400-e29b-41d4-a716-446655440012';
const ADMIN_ID = '550e8400-e29b-41d4-a716-446655440013';

const baseTicket = {
  id: TICKET_ID,
  ticket_number: 'TKT-2026-00001',
  title: 'Purchase Request',
  status: 'OPEN',
};

const baseWorkflow = {
  id: WORKFLOW_ID,
  name: 'Purchase Request',
  approval_type: 'MULTI',
  is_active: true,
};

const steps = [
  { id: STEP1_ID, workflow_id: WORKFLOW_ID, step_order: 1, step_name: 'Manager', approver_role: 'MANAGER' },
  { id: STEP2_ID, workflow_id: WORKFLOW_ID, step_order: 2, step_name: 'Finance', approver_role: 'FINANCE' },
];

function buildDb(overrides = {}) {
  const ticket = overrides.ticket ?? baseTicket;
  const workflow = overrides.workflow ?? baseWorkflow;
  const workflowSteps = overrides.steps ?? steps;
  const approvals = overrides.approvals ?? [];
  const history = overrides.history ?? [];
  const catalogs = overrides.catalogs ?? [
    { id: 'cat-1', name: 'IT Services', category: 'IT', is_active: true, display_order: 1 },
  ];
  const items = overrides.items ?? [
    { id: 'item-1', catalog_id: 'cat-1', name: 'Laptop Request', is_active: true, display_order: 1 },
  ];

  return createMockSupabase({
    handlers: {
      tickets: {
        select: () => ({ data: ticket, error: null }),
      },
      service_catalogs: {
        select: () => ({ data: catalogs, error: null }),
      },
      service_catalog_items: {
        select: () => ({ data: items, error: null }),
      },
      approval_workflows: {
        select: () => ({ data: workflow, error: null }),
        insert: ({ payload }) => {
          const row = { id: WORKFLOW_ID, ...payload, created_at: new Date().toISOString() };
          return { data: row, error: null };
        },
        update: ({ payload }) => ({ data: { ...workflow, ...payload }, error: null }),
      },
      approval_workflow_steps: {
        select: () => ({ data: workflowSteps, error: null }),
        insert: ({ payload }) => {
          const rows = Array.isArray(payload) ? payload : [payload];
          const inserted = rows.map((r, i) => ({ id: `step-${i}`, ...r }));
          return { data: inserted, error: null };
        },
        delete: () => ({ data: null, error: null }),
      },
      ticket_approvals: {
        select: (context) => {
          const { filters, maybeSingle } = context;
          let rows = [...approvals];
          const statusEq = filters.find((f) => f.type === 'eq' && f.column === 'status');
          const statusIn = filters.find((f) => f.type === 'in' && f.column === 'status');
          const ticketFilter = filters.find((f) => f.type === 'eq' && f.column === 'ticket_id');
          const startedByFilter = filters.find((f) => f.type === 'eq' && f.column === 'started_by');
          if (statusEq) rows = rows.filter((r) => r.status === statusEq.value);
          if (statusIn) rows = rows.filter((r) => statusIn.values.includes(r.status));
          if (ticketFilter) rows = rows.filter((r) => r.ticket_id === ticketFilter.value);
          if (startedByFilter) rows = rows.filter((r) => r.started_by === startedByFilter.value);
          if (maybeSingle) return { data: rows[0] ?? null, error: null };
          return { data: rows, error: null };
        },
        insert: ({ payload }) => {
          const row = {
            id: APPROVAL_ID,
            ...payload,
            created_at: new Date().toISOString(),
            started_at: new Date().toISOString(),
          };
          approvals.push(row);
          return { data: row, error: null };
        },
        update: ({ payload, filters }) => {
          const idFilter = filters.find((f) => f.column === 'id');
          const idx = approvals.findIndex((a) => a.id === idFilter?.value);
          if (idx >= 0) approvals[idx] = { ...approvals[idx], ...payload };
          return { data: approvals[idx], error: null };
        },
      },
      approval_history: {
        insert: ({ payload }) => {
          const row = { id: `hist-${history.length + 1}`, ...payload, created_at: new Date().toISOString() };
          history.push(row);
          return { data: row, error: null };
        },
        select: ({ filters }) => {
          const ticketFilter = filters.find((f) => f.column === 'ticket_id');
          const rows = ticketFilter
            ? history.filter((h) => h.ticket_id === ticketFilter.value)
            : history;
          return { data: rows, error: null };
        },
      },
    },
    storage: { approvals, history },
  });
}

function service(db) {
  return new ApprovalManagementService({ supabaseAdmin: db });
}

test('constants include all approval statuses', () => {
  assert.deepEqual(APPROVAL_STATUSES, ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'ESCALATED']);
});

test('constants include approval types', () => {
  assert.deepEqual(APPROVAL_TYPES, ['SINGLE', 'MULTI']);
});

test('constants include catalog categories', () => {
  assert.ok(CATALOG_CATEGORIES.includes('IT'));
  assert.ok(CATALOG_CATEGORIES.includes('PROCUREMENT'));
});

test('WORKFLOW_ADMIN_ROLES includes ADMIN and SUPER_ADMIN', () => {
  assert.ok(WORKFLOW_ADMIN_ROLES.includes('ADMIN'));
  assert.ok(WORKFLOW_ADMIN_ROLES.includes('SUPER_ADMIN'));
});

test('APPROVER_ROLES includes MANAGER and FINANCE', () => {
  assert.ok(APPROVER_ROLES.includes('MANAGER'));
  assert.ok(APPROVER_ROLES.includes('FINANCE'));
});

test('getCatalog returns catalogs with items', async () => {
  const result = await service(buildDb()).getCatalog();
  assert.equal(result.success, true);
  assert.equal(result.data[0].items.length, 1);
});

test('createWorkflow requires admin role', async () => {
  await assert.rejects(
    () => service(buildDb()).createWorkflow(
      { role: 'EMPLOYEE', employeeId: EMPLOYEE_ID },
      { name: 'Test', steps: [{ step_order: 1, step_name: 'M', approver_role: 'MANAGER' }] }
    ),
    (err) => err instanceof AppError && err.statusCode === 403
  );
});

test('createWorkflow succeeds for admin', async () => {
  const result = await service(buildDb()).createWorkflow(
    { role: 'ADMIN', employeeId: ADMIN_ID },
    { name: 'New Flow', steps: [{ step_order: 1, step_name: 'Manager', approver_role: 'MANAGER' }] }
  );
  assert.equal(result.success, true);
  assert.equal(result.data.workflow.name, 'New Flow');
});

test('getWorkflow returns workflow and steps', async () => {
  const result = await service(buildDb()).getWorkflow(WORKFLOW_ID);
  assert.equal(result.data.workflow.id, WORKFLOW_ID);
  assert.equal(result.data.steps.length, 2);
});

test('startTicketApproval creates pending approval', async () => {
  const db = buildDb();
  const result = await service(db).startTicketApproval(
    { role: 'EMPLOYEE', employeeId: EMPLOYEE_ID },
    TICKET_ID,
    { workflow_id: WORKFLOW_ID }
  );
  assert.equal(result.success, true);
  assert.equal(result.data.approval.status, 'PENDING');
});

test('startTicketApproval rejects duplicate active approval', async () => {
  const db = buildDb({
    approvals: [{
      id: APPROVAL_ID,
      ticket_id: TICKET_ID,
      workflow_id: WORKFLOW_ID,
      current_step_id: STEP1_ID,
      status: 'PENDING',
      started_by: EMPLOYEE_ID,
    }],
  });
  await assert.rejects(
    () => service(db).startTicketApproval(
      { role: 'EMPLOYEE', employeeId: EMPLOYEE_ID },
      TICKET_ID,
      { workflow_id: WORKFLOW_ID }
    ),
    (err) => err instanceof AppError && err.statusCode === 409
  );
});

test('startTicketApproval requires employee profile', async () => {
  await assert.rejects(
    () => service(buildDb()).startTicketApproval(
      { role: 'EMPLOYEE' },
      TICKET_ID,
      { workflow_id: WORKFLOW_ID }
    ),
    (err) => err instanceof AppError && err.statusCode === 403
  );
});

test('startTicketApproval rejects inactive workflow', async () => {
  await assert.rejects(
    () => service(buildDb({ workflow: { ...baseWorkflow, is_active: false } })).startTicketApproval(
      { role: 'EMPLOYEE', employeeId: EMPLOYEE_ID },
      TICKET_ID,
      { workflow_id: WORKFLOW_ID }
    ),
    (err) => err instanceof AppError && err.statusCode === 400
  );
});

test('manager can approve first step', async () => {
  const approvals = [{
    id: APPROVAL_ID,
    ticket_id: TICKET_ID,
    workflow_id: WORKFLOW_ID,
    current_step_id: STEP1_ID,
    status: 'PENDING',
    started_by: EMPLOYEE_ID,
  }];
  const db = buildDb({ approvals });
  const result = await service(db).approveTicketStep(
    { role: 'MANAGER', employeeId: MANAGER_ID },
    TICKET_ID,
    { comments: 'Looks good' }
  );
  assert.equal(result.success, true);
  assert.equal(result.data.status, 'PENDING');
  assert.equal(result.data.current_step.id, STEP2_ID);
});

test('finance can approve second step and complete', async () => {
  const approvals = [{
    id: APPROVAL_ID,
    ticket_id: TICKET_ID,
    workflow_id: WORKFLOW_ID,
    current_step_id: STEP2_ID,
    status: 'PENDING',
    started_by: EMPLOYEE_ID,
  }];
  const db = buildDb({ approvals });
  const result = await service(db).approveTicketStep(
    { role: 'FINANCE', employeeId: FINANCE_ID },
    TICKET_ID,
    {}
  );
  assert.equal(result.success, true);
  assert.equal(result.data.status, 'APPROVED');
});

test('employee cannot approve manager step', async () => {
  const approvals = [{
    id: APPROVAL_ID,
    ticket_id: TICKET_ID,
    workflow_id: WORKFLOW_ID,
    current_step_id: STEP1_ID,
    status: 'PENDING',
    started_by: EMPLOYEE_ID,
  }];
  await assert.rejects(
    () => service(buildDb({ approvals })).approveTicketStep(
      { role: 'EMPLOYEE', employeeId: EMPLOYEE_ID },
      TICKET_ID,
      {}
    ),
    (err) => err instanceof AppError && err.statusCode === 403
  );
});

test('reject sets status REJECTED', async () => {
  const approvals = [{
    id: APPROVAL_ID,
    ticket_id: TICKET_ID,
    workflow_id: WORKFLOW_ID,
    current_step_id: STEP1_ID,
    status: 'PENDING',
    started_by: EMPLOYEE_ID,
  }];
  const result = await service(buildDb({ approvals })).rejectTicketStep(
    { role: 'MANAGER', employeeId: MANAGER_ID },
    TICKET_ID,
    { comments: 'Budget exceeded' }
  );
  assert.equal(result.data.status, 'REJECTED');
});

test('approve fails when no active approval', async () => {
  await assert.rejects(
    () => service(buildDb()).approveTicketStep(
      { role: 'MANAGER', employeeId: MANAGER_ID },
      TICKET_ID,
      {}
    ),
    (err) => err instanceof AppError && err.statusCode === 404
  );
});

test('getMyApprovals returns started approvals', async () => {
  const mockRepo = {
    listMyApprovals: async () => [{
      id: APPROVAL_ID,
      ticket_id: TICKET_ID,
      workflow_id: WORKFLOW_ID,
      status: 'PENDING',
      started_by: EMPLOYEE_ID,
    }],
  };
  const result = await new ApprovalManagementService({ repository: mockRepo }).getMyApprovals(
    { role: 'EMPLOYEE', employeeId: EMPLOYEE_ID }
  );
  assert.equal(result.data.length, 1);
});

test('getPendingApprovals filters by role', async () => {
  const pendingApproval = {
    id: APPROVAL_ID,
    ticket_id: TICKET_ID,
    workflow_id: WORKFLOW_ID,
    current_step_id: STEP1_ID,
    status: 'PENDING',
    started_by: EMPLOYEE_ID,
  };
  const mockRepo = {
    listPendingApprovals: async () => [pendingApproval],
    getWorkflowSteps: async () => steps,
  };
  const result = await new ApprovalManagementService({ repository: mockRepo }).getPendingApprovals(
    { role: 'MANAGER', employeeId: MANAGER_ID }
  );
  assert.equal(result.data.length, 1);
  assert.equal(result.data[0].current_step.step_name, 'Manager');
});

test('getTicketApprovalState returns active approval with can_act', async () => {
  const approvals = [{
    id: APPROVAL_ID,
    ticket_id: TICKET_ID,
    workflow_id: WORKFLOW_ID,
    current_step_id: STEP1_ID,
    status: 'PENDING',
    started_by: EMPLOYEE_ID,
  }];
  const result = await service(buildDb({ approvals })).getTicketApprovalState(
    { role: 'MANAGER', employeeId: MANAGER_ID },
    TICKET_ID
  );
  assert.equal(result.data.active.status, 'PENDING');
  assert.equal(result.data.can_act, true);
});

test('getTicketApprovalState returns history when no active', async () => {
  const history = [{
    id: 'h1',
    ticket_id: TICKET_ID,
    action: 'SUBMITTED',
    created_at: new Date().toISOString(),
  }];
  const result = await service(buildDb({ history })).getTicketApprovalState(
    { role: 'EMPLOYEE', employeeId: EMPLOYEE_ID },
    TICKET_ID
  );
  assert.equal(result.data.active, null);
  assert.equal(result.data.history.length, 1);
});

test('getAnalytics requires manager or admin', async () => {
  await assert.rejects(
    () => service(buildDb()).getAnalytics({ role: 'EMPLOYEE', employeeId: EMPLOYEE_ID }),
    (err) => err instanceof AppError && err.statusCode === 403
  );
});

test('getAnalytics succeeds for admin', async () => {
  const mockRepo = {
    countApprovalsByStatus: async () => ({ PENDING: 1, APPROVED: 2 }),
    listPendingApprovals: async () => [{ id: 'p1' }],
  };
  const result = await new ApprovalManagementService({ repository: mockRepo }).getAnalytics(
    { role: 'ADMIN', employeeId: ADMIN_ID }
  );
  assert.equal(result.data.totalApprovals, 3);
  assert.equal(result.data.statusCounts.APPROVED, 2);
});

test('admin can approve any step', async () => {
  const approvals = [{
    id: APPROVAL_ID,
    ticket_id: TICKET_ID,
    workflow_id: WORKFLOW_ID,
    current_step_id: STEP1_ID,
    status: 'PENDING',
    started_by: EMPLOYEE_ID,
  }];
  const result = await service(buildDb({ approvals })).approveTicketStep(
    { role: 'ADMIN', employeeId: ADMIN_ID },
    TICKET_ID,
    {}
  );
  assert.equal(result.success, true);
});

test('updateWorkflow requires admin', async () => {
  await assert.rejects(
    () => service(buildDb()).updateWorkflow(
      { role: 'MANAGER', employeeId: MANAGER_ID },
      WORKFLOW_ID,
      { name: 'Updated' }
    ),
    (err) => err instanceof AppError && err.statusCode === 403
  );
});

test('updateWorkflow succeeds for super admin', async () => {
  const result = await service(buildDb()).updateWorkflow(
    { role: 'SUPER_ADMIN', employeeId: ADMIN_ID },
    WORKFLOW_ID,
    { name: 'Updated Flow' }
  );
  assert.equal(result.data.workflow.name, 'Updated Flow');
});

test('canApproveStep matches approver_employee_id', async () => {
  const customSteps = [{
    id: STEP1_ID,
    workflow_id: WORKFLOW_ID,
    step_order: 1,
    step_name: 'Specific Manager',
    approver_role: 'MANAGER',
    approver_employee_id: MANAGER_ID,
  }];
  const approvals = [{
    id: APPROVAL_ID,
    ticket_id: TICKET_ID,
    workflow_id: WORKFLOW_ID,
    current_step_id: STEP1_ID,
    status: 'PENDING',
    started_by: EMPLOYEE_ID,
  }];
  const result = await service(buildDb({ steps: customSteps, approvals })).approveTicketStep(
    { role: 'EMPLOYEE', employeeId: MANAGER_ID },
    TICKET_ID,
    {}
  );
  assert.equal(result.success, true);
});

test('getMyApprovals requires employee profile', async () => {
  await assert.rejects(
    () => service(buildDb()).getMyApprovals({ role: 'EMPLOYEE' }),
    (err) => err instanceof AppError && err.statusCode === 403
  );
});

test('HR can approve HR step', async () => {
  const hrSteps = [{
    id: STEP1_ID,
    workflow_id: WORKFLOW_ID,
    step_order: 1,
    step_name: 'HR Review',
    approver_role: 'HR',
  }];
  const approvals = [{
    id: APPROVAL_ID,
    ticket_id: TICKET_ID,
    workflow_id: WORKFLOW_ID,
    current_step_id: STEP1_ID,
    status: 'PENDING',
    started_by: EMPLOYEE_ID,
  }];
  const result = await service(buildDb({ steps: hrSteps, approvals })).approveTicketStep(
    { role: 'HR', employeeId: '550e8400-e29b-41d4-a716-446655440014' },
    TICKET_ID,
    {}
  );
  assert.equal(result.success, true);
});

test('single step approval completes on first approve', async () => {
  const singleSteps = [steps[0]];
  const approvals = [{
    id: APPROVAL_ID,
    ticket_id: TICKET_ID,
    workflow_id: WORKFLOW_ID,
    current_step_id: STEP1_ID,
    status: 'PENDING',
    started_by: EMPLOYEE_ID,
  }];
  const result = await service(buildDb({ steps: singleSteps, approvals })).approveTicketStep(
    { role: 'MANAGER', employeeId: MANAGER_ID },
    TICKET_ID,
    {}
  );
  assert.equal(result.data.status, 'APPROVED');
});

test('getAnalytics succeeds for manager role', async () => {
  const result = await service(buildDb()).getAnalytics({ role: 'MANAGER', employeeId: MANAGER_ID });
  assert.equal(result.success, true);
});

test('getAnalytics succeeds for HR role', async () => {
  const result = await service(buildDb()).getAnalytics({ role: 'HR', employeeId: '550e8400-e29b-41d4-a716-446655440014' });
  assert.equal(result.success, true);
});

test('startTicketApproval rejects workflow with no steps', async () => {
  await assert.rejects(
    () => service(buildDb({ steps: [] })).startTicketApproval(
      { role: 'EMPLOYEE', employeeId: EMPLOYEE_ID },
      TICKET_ID,
      { workflow_id: WORKFLOW_ID }
    ),
    (err) => err instanceof AppError && err.statusCode === 400
  );
});

test('pending list empty for unrelated role', async () => {
  const mockRepo = {
    listPendingApprovals: async () => [{
      id: APPROVAL_ID,
      ticket_id: TICKET_ID,
      workflow_id: WORKFLOW_ID,
      current_step_id: STEP1_ID,
      status: 'PENDING',
      started_by: EMPLOYEE_ID,
    }],
    getWorkflowSteps: async () => steps,
  };
  const result = await new ApprovalManagementService({ repository: mockRepo }).getPendingApprovals(
    { role: 'FINANCE', employeeId: FINANCE_ID }
  );
  assert.equal(result.data.length, 0);
});
