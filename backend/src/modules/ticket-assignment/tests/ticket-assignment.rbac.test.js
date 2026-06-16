const test = require('node:test');
const assert = require('node:assert/strict');
const TicketAssignmentService = require('../ticket-assignment.service');
const AppError = require('../../../utils/app-error');
const { createMockSupabase } = require('../../ticketing/tests/helpers/mock-supabase');

const DEPT_A = '550e8400-e29b-41d4-a716-446655440020';
const DEPT_B = '550e8400-e29b-41d4-a716-446655440021';
const MANAGER_ID = '550e8400-e29b-41d4-a716-446655440011';
const TICKET_ID = '550e8400-e29b-41d4-a716-446655440001';

test('Manager cannot assign ticket outside department', async () => {
  const ticket = {
    id: TICKET_ID,
    status: 'OPEN',
    department_id: DEPT_B,
    assignee_id: null,
    requester_id: 'emp-1',
  };

  const mockDb = createMockSupabase({
    handlers: {
      tickets: {
        select: () => ({ data: ticket, error: null }),
      },
      employees: {
        select: () => ({ data: { department_id: DEPT_A }, error: null }),
      },
    },
  });

  const service = new TicketAssignmentService({ supabaseAdmin: mockDb });
  await assert.rejects(
    () => service.assignTicket(
      { id: 'mgr', role: 'MANAGER', employeeId: MANAGER_ID },
      { ticket_id: TICKET_ID, assigned_to: '550e8400-e29b-41d4-a716-446655440099' }
    ),
    (err) => err instanceof AppError && err.statusCode === 403
  );
});

test('Manager cannot view history for other department ticket', async () => {
  const ticket = {
    id: TICKET_ID,
    department_id: DEPT_B,
    requester_id: 'emp-2',
    assignee_id: null,
  };

  const mockDb = createMockSupabase({
    handlers: {
      tickets: {
        select: () => ({ data: ticket, error: null }),
      },
      employees: {
        select: () => ({ data: { department_id: DEPT_A }, error: null }),
      },
    },
  });

  const service = new TicketAssignmentService({ supabaseAdmin: mockDb });
  await assert.rejects(
    () => service.getTicketHistory({ id: 'mgr', role: 'MANAGER', employeeId: MANAGER_ID }, TICKET_ID),
    (err) => err instanceof AppError && err.statusCode === 403
  );
});

test('HR can access team queue (all tickets)', async () => {
  const mockDb = createMockSupabase({
    handlers: {
      tickets: {
        select: () => ({ data: [], error: null, count: 0 }),
      },
      employees: {
        select: () => ({ data: { department_id: DEPT_A }, error: null }),
      },
    },
  });

  const service = new TicketAssignmentService({ supabaseAdmin: mockDb });
  const result = await service.getTeamQueue(
    { id: 'hr', role: 'HR', employeeId: 'hr-1' },
    { page: 1, limit: 20 }
  );
  assert.equal(result.success, true);
});

test('Manager analytics scoped to department', async () => {
  const mockDb = createMockSupabase({
    handlers: {
      tickets: {
        select: () => ({ data: [{ department_id: DEPT_A, assignee_id: 'a1', status: 'OPEN' }], error: null, count: 1 }),
      },
      ticket_assignment_history: {
        select: () => ({ data: [{ changed_at: new Date().toISOString() }], error: null }),
      },
      employees: {
        select: () => ({ data: { department_id: DEPT_A }, error: null }),
      },
    },
  });

  const service = new TicketAssignmentService({ supabaseAdmin: mockDb });
  const result = await service.getAnalytics({ id: 'mgr', role: 'MANAGER', employeeId: MANAGER_ID });
  assert.ok(result.data.totalAssigned >= 0);
});

test('Employee cannot view unrelated ticket history', async () => {
  const ticket = {
    id: TICKET_ID,
    department_id: DEPT_A,
    requester_id: 'other-emp',
    assignee_id: 'other-agent',
  };

  const mockDb = createMockSupabase({
    handlers: {
      tickets: {
        select: () => ({ data: ticket, error: null }),
      },
    },
  });

  const service = new TicketAssignmentService({ supabaseAdmin: mockDb });
  await assert.rejects(
    () => service.getTicketHistory({ id: 'emp', role: 'EMPLOYEE', employeeId: 'emp-self' }, TICKET_ID),
    (err) => err instanceof AppError && err.statusCode === 403
  );
});

test('Assignee can view ticket history', async () => {
  const ticket = {
    id: TICKET_ID,
    department_id: DEPT_A,
    requester_id: 'other-emp',
    assignee_id: 'emp-self',
  };

  const mockDb = createMockSupabase({
    handlers: {
      tickets: {
        select: () => ({ data: ticket, error: null }),
      },
      ticket_assignment_history: {
        select: () => ({ data: [{ id: 'h1' }], error: null }),
      },
    },
  });

  const service = new TicketAssignmentService({ supabaseAdmin: mockDb });
  const result = await service.getTicketHistory(
    { id: 'emp', role: 'EMPLOYEE', employeeId: 'emp-self' },
    TICKET_ID
  );
  assert.equal(result.data.length, 1);
});
