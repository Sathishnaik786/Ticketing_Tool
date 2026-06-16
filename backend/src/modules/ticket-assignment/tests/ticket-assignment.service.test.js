const test = require('node:test');
const assert = require('node:assert/strict');
const TicketAssignmentService = require('../ticket-assignment.service');
const AppError = require('../../../utils/app-error');
const { createMockSupabase } = require('../../ticketing/tests/helpers/mock-supabase');

const TICKET_ID = '550e8400-e29b-41d4-a716-446655440001';
const EMPLOYEE_ID = '550e8400-e29b-41d4-a716-446655440010';
const MANAGER_ID = '550e8400-e29b-41d4-a716-446655440011';
const HR_ID = '550e8400-e29b-41d4-a716-446655440012';
const ADMIN_ID = '550e8400-e29b-41d4-a716-446655440013';
const ASSIGNEE_ID = '550e8400-e29b-41d4-a716-446655440014';
const DEPT_ID = '550e8400-e29b-41d4-a716-446655440020';

const openTicket = {
  id: TICKET_ID,
  ticket_number: 'TKT-2026-00001',
  title: 'VPN issue',
  status: 'OPEN',
  priority: 'MEDIUM',
  department_id: DEPT_ID,
  assignee_id: null,
  requester_id: EMPLOYEE_ID,
};

const assignedTicket = { ...openTicket, status: 'ASSIGNED', assignee_id: ASSIGNEE_ID };

function buildDb({ ticket = openTicket, history = [] } = {}) {
  const historyStore = [...history];
  const assignmentStore = [];

  return createMockSupabase({
    handlers: {
      tickets: {
        select: ({ filters, rangeArgs }) => {
          const idFilter = filters.find((f) => f.column === 'id');
          if (idFilter) {
            return { data: ticket, error: null, count: 1 };
          }
          const assigneeFilter = filters.find((f) => f.column === 'assignee_id');
          const deptFilter = filters.find((f) => f.column === 'department_id');
          const unassignedFilter = filters.find((f) => f.type === 'is' && f.column === 'assignee_id');

          let rows = [ticket];
          if (assigneeFilter) rows = rows.filter((t) => t.assignee_id === assigneeFilter.value);
          if (deptFilter) rows = rows.filter((t) => t.department_id === deptFilter.value);
          if (unassignedFilter) rows = rows.filter((t) => !t.assignee_id);
          return { data: rows, error: null, count: rows.length };
        },
        update: ({ payload }) => ({ data: { ...ticket, ...payload }, error: null }),
      },
      ticket_assignments: {
        update: () => ({ data: null, error: null }),
        insert: ({ payload }) => {
          const record = Array.isArray(payload) ? payload[0] : payload;
          const row = { id: 'assign-1', ...record };
          assignmentStore.push(row);
          return { data: row, error: null };
        },
      },
      ticket_assignment_history: {
        insert: ({ payload }) => {
          const record = Array.isArray(payload) ? payload[0] : payload;
          const row = { id: 'hist-1', ...record, changed_at: new Date().toISOString() };
          historyStore.push(row);
          return { data: row, error: null };
        },
        select: () => ({ data: historyStore, error: null }),
      },
      employees: {
        select: ({ filters }) => {
          const idFilter = filters.find((f) => f.column === 'id');
          if (idFilter?.value === MANAGER_ID) return { data: { department_id: DEPT_ID }, error: null };
          if (idFilter?.value === HR_ID) return { data: { department_id: DEPT_ID }, error: null };
          return { data: { department_id: DEPT_ID }, error: null };
        },
      },
    },
  });
}

test('Manager can assign unassigned ticket', async () => {
  const service = new TicketAssignmentService({ supabaseAdmin: buildDb() });
  const result = await service.assignTicket(
    { id: 'mgr', role: 'MANAGER', employeeId: MANAGER_ID },
    { ticket_id: TICKET_ID, assigned_to: ASSIGNEE_ID, assignment_type: 'MANUAL' }
  );
  assert.equal(result.success, true);
  assert.equal(result.data.ticket.assignee_id, ASSIGNEE_ID);
});

test('Admin can assign any ticket', async () => {
  const service = new TicketAssignmentService({ supabaseAdmin: buildDb() });
  const result = await service.assignTicket(
    { id: 'admin', role: 'ADMIN', employeeId: ADMIN_ID },
    { ticket_id: TICKET_ID, assigned_to: ASSIGNEE_ID }
  );
  assert.equal(result.success, true);
});

test('HR can assign ticket', async () => {
  const service = new TicketAssignmentService({ supabaseAdmin: buildDb() });
  const result = await service.assignTicket(
    { id: 'hr', role: 'HR', employeeId: HR_ID },
    { ticket_id: TICKET_ID, assigned_to: ASSIGNEE_ID }
  );
  assert.equal(result.success, true);
});

test('Employee cannot assign ticket', async () => {
  const service = new TicketAssignmentService({ supabaseAdmin: buildDb() });
  await assert.rejects(
    () => service.assignTicket(
      { id: 'emp', role: 'EMPLOYEE', employeeId: EMPLOYEE_ID },
      { ticket_id: TICKET_ID, assigned_to: ASSIGNEE_ID }
    ),
    (err) => err instanceof AppError && err.statusCode === 403
  );
});

test('Rejects assign when ticket already assigned', async () => {
  const service = new TicketAssignmentService({ supabaseAdmin: buildDb({ ticket: assignedTicket }) });
  await assert.rejects(
    () => service.assignTicket(
      { id: 'admin', role: 'ADMIN', employeeId: ADMIN_ID },
      { ticket_id: TICKET_ID, assigned_to: ASSIGNEE_ID }
    ),
    (err) => err instanceof AppError && err.statusCode === 409
  );
});

test('Manager can reassign department ticket', async () => {
  const service = new TicketAssignmentService({ supabaseAdmin: buildDb({ ticket: assignedTicket }) });
  const result = await service.reassignTicket(
    { id: 'mgr', role: 'MANAGER', employeeId: MANAGER_ID },
    TICKET_ID,
    { assigned_to: MANAGER_ID, reason: 'Workload balance' }
  );
  assert.equal(result.success, true);
  assert.ok(result.data.history);
});

test('Employee cannot reassign ticket', async () => {
  const service = new TicketAssignmentService({ supabaseAdmin: buildDb({ ticket: assignedTicket }) });
  await assert.rejects(
    () => service.reassignTicket(
      { id: 'emp', role: 'EMPLOYEE', employeeId: EMPLOYEE_ID },
      TICKET_ID,
      { assigned_to: MANAGER_ID }
    ),
    (err) => err instanceof AppError && err.statusCode === 403
  );
});

test('Assign records history entry', async () => {
  const service = new TicketAssignmentService({ supabaseAdmin: buildDb() });
  const result = await service.assignTicket(
    { id: 'admin', role: 'ADMIN', employeeId: ADMIN_ID },
    { ticket_id: TICKET_ID, assigned_to: ASSIGNEE_ID, reason: 'Initial assign' }
  );
  assert.ok(result.data.history);
  assert.equal(result.data.history.new_assignee, ASSIGNEE_ID);
});

test('Reassign records old and new assignee in history', async () => {
  const service = new TicketAssignmentService({ supabaseAdmin: buildDb({ ticket: assignedTicket }) });
  const result = await service.reassignTicket(
    { id: 'admin', role: 'ADMIN', employeeId: ADMIN_ID },
    TICKET_ID,
    { assigned_to: MANAGER_ID, assignment_type: 'REASSIGNED' }
  );
  assert.equal(result.data.history.old_assignee, ASSIGNEE_ID);
  assert.equal(result.data.history.new_assignee, MANAGER_ID);
});

test('My queue returns assigned tickets for employee', async () => {
  const service = new TicketAssignmentService({
    supabaseAdmin: buildDb({ ticket: { ...assignedTicket, assignee_id: EMPLOYEE_ID } }),
  });
  const result = await service.getMyQueue(
    { id: 'emp', role: 'EMPLOYEE', employeeId: EMPLOYEE_ID },
    { page: 1, limit: 20 }
  );
  assert.equal(result.success, true);
  assert.ok(Array.isArray(result.data));
});

test('Employee cannot access team queue', async () => {
  const service = new TicketAssignmentService({ supabaseAdmin: buildDb() });
  await assert.rejects(
    () => service.getTeamQueue({ id: 'emp', role: 'EMPLOYEE', employeeId: EMPLOYEE_ID }, {}),
    (err) => err instanceof AppError && err.statusCode === 403
  );
});

test('Manager can access team queue', async () => {
  const service = new TicketAssignmentService({ supabaseAdmin: buildDb() });
  const result = await service.getTeamQueue(
    { id: 'mgr', role: 'MANAGER', employeeId: MANAGER_ID },
    { page: 1, limit: 20 }
  );
  assert.equal(result.success, true);
});

test('Admin can access unassigned queue', async () => {
  const service = new TicketAssignmentService({ supabaseAdmin: buildDb() });
  const result = await service.getUnassigned(
    { id: 'admin', role: 'ADMIN', employeeId: ADMIN_ID },
    { page: 1, limit: 20 }
  );
  assert.equal(result.success, true);
});

test('Employee cannot access unassigned queue', async () => {
  const service = new TicketAssignmentService({ supabaseAdmin: buildDb() });
  await assert.rejects(
    () => service.getUnassigned({ id: 'emp', role: 'EMPLOYEE', employeeId: EMPLOYEE_ID }, {}),
    (err) => err instanceof AppError && err.statusCode === 403
  );
});

test('Admin can access analytics', async () => {
  const service = new TicketAssignmentService({ supabaseAdmin: buildDb() });
  const result = await service.getAnalytics({ id: 'admin', role: 'ADMIN', employeeId: ADMIN_ID });
  assert.equal(result.success, true);
  assert.ok(typeof result.data.assignmentCount === 'number');
});

test('Employee cannot access analytics', async () => {
  const service = new TicketAssignmentService({ supabaseAdmin: buildDb() });
  await assert.rejects(
    () => service.getAnalytics({ id: 'emp', role: 'EMPLOYEE', employeeId: EMPLOYEE_ID }),
    (err) => err instanceof AppError && err.statusCode === 403
  );
});

test('Rejects invalid assigned_to uuid', async () => {
  const service = new TicketAssignmentService({ supabaseAdmin: buildDb() });
  await assert.rejects(
    () => service.assignTicket(
      { id: 'admin', role: 'ADMIN', employeeId: ADMIN_ID },
      { ticket_id: TICKET_ID, assigned_to: 'bad-id' }
    ),
    (err) => err instanceof AppError && err.statusCode === 400
  );
});

test('Rejects assign without employee profile', async () => {
  const service = new TicketAssignmentService({ supabaseAdmin: buildDb() });
  await assert.rejects(
    () => service.assignTicket(
      { id: 'admin', role: 'ADMIN' },
      { ticket_id: TICKET_ID, assigned_to: ASSIGNEE_ID }
    ),
    (err) => err instanceof AppError && err.statusCode === 403
  );
});

test('Requester can view ticket assignment history', async () => {
  const service = new TicketAssignmentService({
    supabaseAdmin: buildDb({
      ticket: assignedTicket,
      history: [{ id: 'h1', ticket_id: TICKET_ID, new_assignee: ASSIGNEE_ID }],
    }),
  });
  const result = await service.getTicketHistory(
    { id: 'emp', role: 'EMPLOYEE', employeeId: EMPLOYEE_ID },
    TICKET_ID
  );
  assert.equal(result.data.length, 1);
});

test('OPEN ticket transitions to ASSIGNED on assign', async () => {
  const service = new TicketAssignmentService({ supabaseAdmin: buildDb() });
  const result = await service.assignTicket(
    { id: 'admin', role: 'ADMIN', employeeId: ADMIN_ID },
    { ticket_id: TICKET_ID, assigned_to: ASSIGNEE_ID }
  );
  assert.equal(result.data.ticket.status, 'ASSIGNED');
});
