const test = require('node:test');
const assert = require('node:assert/strict');
const TicketService = require('../services/ticket.service');
const AssignmentService = require('../services/assignment.service');
const AppError = require('../../../utils/app-error');
const { createMockSupabase } = require('./helpers/mock-supabase');
const { mockNotificationService, mockActivityService } = require('./helpers/test-deps');

const TICKET_ID = '550e8400-e29b-41d4-a716-446655440001';
const EMPLOYEE_ID = '550e8400-e29b-41d4-a716-446655440010';
const MANAGER_ID = '550e8400-e29b-41d4-a716-446655440011';
const HR_ID = '550e8400-e29b-41d4-a716-446655440012';
const ASSIGNEE_ID = '550e8400-e29b-41d4-a716-446655440013';
const DEPT_ID = '550e8400-e29b-41d4-a716-446655440020';

const baseTicket = {
  id: TICKET_ID,
  ticket_number: 'TKT-2026-00001',
  title: 'VPN not working',
  description: 'Unable to connect to corporate VPN from home network.',
  department_id: DEPT_ID,
  priority: 'MEDIUM',
  status: 'OPEN',
  requester_id: EMPLOYEE_ID,
  assignee_id: null,
  created_by: 'user-employee',
};

function buildTicketDb(overrides = {}) {
  const ticket = { ...baseTicket, ...overrides.ticket };

  return createMockSupabase({
    handlers: {
      tickets: {
        insert: () => ({ data: { ...ticket, id: TICKET_ID, status: 'OPEN' }, error: null }),
        select: () => ({ data: ticket, error: null, count: 1 }),
        update: ({ payload }) => ({ data: { ...ticket, ...payload }, error: null }),
      },
      ticket_activities: {
        insert: () => ({ data: { id: 'activity-1' }, error: null }),
      },
      ticket_sla_rules: {
        select: () => ({
          data: {
            response_time_minutes: 120,
            resolution_time_minutes: 1440,
            priority: 'MEDIUM',
          },
          error: null,
        }),
      },
      employees: {
        select: ({ filters }) => {
          const idFilter = filters.find((f) => f.column === 'id');
          if (idFilter?.value === EMPLOYEE_ID) {
            return { data: { department_id: DEPT_ID, user_id: 'user-employee' }, error: null };
          }
          if (idFilter?.value === MANAGER_ID) {
            return { data: { department_id: DEPT_ID, user_id: 'user-manager' }, error: null };
          }
          return { data: { user_id: 'user-hr' }, error: null };
        },
      },
      ticket_watchers: {
        select: () => ({ data: null, error: null }),
      },
    },
  });
}

test('Employee can create ticket', async () => {
  const mockDb = buildTicketDb();
  const service = new TicketService({
    supabaseAdmin: mockDb,
    notificationService: mockNotificationService,
    activityService: mockActivityService,
  });

  const result = await service.createTicket(
    { id: 'user-employee', role: 'EMPLOYEE', employeeId: EMPLOYEE_ID },
    {
      title: 'VPN not working',
      description: 'Unable to connect to corporate VPN from home network.',
      department_id: DEPT_ID,
      priority: 'MEDIUM',
    }
  );

  assert.equal(result.success, true);
  assert.equal(result.data.status, 'OPEN');
});

test('Employee cannot assign ticket', async () => {
  const mockDb = buildTicketDb();
  const assignmentService = new AssignmentService({
    supabaseAdmin: mockDb,
    notificationService: mockNotificationService,
    activityService: mockActivityService,
  });

  await assert.rejects(
    () => assignmentService.assignTicket(
      { id: 'user-employee', role: 'EMPLOYEE', employeeId: EMPLOYEE_ID },
      TICKET_ID,
      { assignee_id: ASSIGNEE_ID }
    ),
    (error) => error instanceof AppError && error.statusCode === 403
  );
});

test('Manager can assign department ticket', async () => {
  const mockDb = createMockSupabase({
    handlers: {
      tickets: {
        select: () => ({ data: baseTicket, error: null }),
        update: ({ payload }) => ({ data: { ...baseTicket, ...payload, status: 'ASSIGNED' }, error: null }),
      },
      ticket_assignments: {
        update: () => ({ data: null, error: null }),
        insert: () => ({ data: { id: 'assign-1', assignee_id: ASSIGNEE_ID }, error: null }),
      },
      employees: {
        select: ({ filters }) => {
          const idFilter = filters.find((f) => f.column === 'id');
          if (idFilter?.value === MANAGER_ID) {
            return { data: { department_id: DEPT_ID, user_id: 'user-manager' }, error: null };
          }
          return { data: { user_id: 'user-assignee' }, error: null };
        },
      },
      ticket_activities: {
        insert: () => ({ data: { id: 'activity-1' }, error: null }),
      },
      ticket_watchers: {
        select: () => ({ data: null, error: null }),
      },
    },
  });

  const assignmentService = new AssignmentService({
    supabaseAdmin: mockDb,
    notificationService: mockNotificationService,
    activityService: mockActivityService,
  });

  const result = await assignmentService.assignTicket(
    { id: 'user-manager', role: 'MANAGER', employeeId: MANAGER_ID },
    TICKET_ID,
    { assignee_id: ASSIGNEE_ID }
  );

  assert.equal(result.success, true);
  assert.equal(result.data.ticket.status, 'ASSIGNED');
});

test('HR can view all tickets via list scope', async () => {
  const mockDb = createMockSupabase({
    handlers: {
      tickets: {
        select: () => ({
          data: [baseTicket],
          error: null,
          count: 1,
        }),
      },
      employees: {
        select: () => ({ data: { department_id: DEPT_ID }, error: null }),
      },
      ticket_watchers: {
        select: () => ({ data: null, error: null }),
      },
    },
  });

  const service = new TicketService({
    supabaseAdmin: mockDb,
    notificationService: mockNotificationService,
    activityService: mockActivityService,
  });
  const result = await service.listTickets(
    { id: 'user-hr', role: 'HR', employeeId: HR_ID },
    { page: 1, limit: 20 }
  );

  assert.equal(result.success, true);
  assert.equal(result.data.length, 1);
  assert.equal(result.meta.total, 1);
});

test('Invalid status transition is rejected', async () => {
  const assignedTicket = {
    ...baseTicket,
    status: 'ASSIGNED',
    assignee_id: MANAGER_ID,
  };

  const mockDb = createMockSupabase({
    handlers: {
      tickets: {
        select: () => ({ data: assignedTicket, error: null }),
      },
      employees: {
        select: ({ filters }) => {
          const idFilter = filters.find((f) => f.column === 'id');
          if (idFilter?.value === MANAGER_ID) {
            return { data: { department_id: DEPT_ID, user_id: 'user-manager' }, error: null };
          }
          return { data: { user_id: 'user-other' }, error: null };
        },
      },
      ticket_watchers: {
        select: () => ({ data: null, error: null }),
      },
    },
  });

  const service = new TicketService({
    supabaseAdmin: mockDb,
    notificationService: mockNotificationService,
    activityService: mockActivityService,
  });

  await assert.rejects(
    () => service.changeStatus(
      { id: 'user-manager', role: 'MANAGER', employeeId: MANAGER_ID },
      TICKET_ID,
      { status: 'CLOSED' }
    ),
    (error) => error instanceof AppError && error.statusCode === 400
  );
});

test('Employee can view own ticket by id', async () => {
  const mockDb = buildTicketDb();
  const service = new TicketService({
    supabaseAdmin: mockDb,
    notificationService: mockNotificationService,
    activityService: mockActivityService,
  });

  const result = await service.getTicketById(
    { id: 'user-employee', role: 'EMPLOYEE', employeeId: EMPLOYEE_ID },
    TICKET_ID
  );

  assert.equal(result.success, true);
  assert.equal(result.data.id, TICKET_ID);
});

test('Employee cannot view another users ticket', async () => {
  const mockDb = buildTicketDb();
  const service = new TicketService({
    supabaseAdmin: mockDb,
    notificationService: mockNotificationService,
    activityService: mockActivityService,
  });

  await assert.rejects(
    () => service.getTicketById(
      { id: 'user-other', role: 'EMPLOYEE', employeeId: '550e8400-e29b-41d4-a716-446655440099' },
      TICKET_ID
    ),
    (error) => error instanceof AppError && error.statusCode === 403
  );
});
