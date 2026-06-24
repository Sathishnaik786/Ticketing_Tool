const test = require('node:test');
const assert = require('node:assert/strict');
const AssignmentService = require('../services/assignment.service');
const { createMockSupabase } = require('./helpers/mock-supabase');
const { mockNotificationService, mockActivityService } = require('./helpers/test-deps');

const TICKET_ID = '550e8400-e29b-41d4-a716-446655440001';
const MANAGER_ID = '550e8400-e29b-41d4-a716-446655440011';
const ASSIGNEE_ID = '550e8400-e29b-41d4-a716-446655440013';
const NEW_ASSIGNEE_ID = '550e8400-e29b-41d4-a716-446655440014';
const DEPT_ID = '550e8400-e29b-41d4-a716-446655440020';

const ticket = {
  id: TICKET_ID,
  ticket_number: 'TKT-2026-00002',
  title: 'Printer issue',
  department_id: DEPT_ID,
  status: 'ASSIGNED',
  assignee_id: ASSIGNEE_ID,
  requester_id: '550e8400-e29b-41d4-a716-446655440010',
};

test('Assignment history is returned for authorized manager', async () => {
  const history = [
    { id: 'a2', assignee_id: ASSIGNEE_ID, is_current: true },
    { id: 'a1', assignee_id: NEW_ASSIGNEE_ID, is_current: false },
  ];

  const mockDb = createMockSupabase({
    handlers: {
      tickets: {
        select: () => ({ data: ticket, error: null }),
      },
      employees: {
        select: () => ({ data: { department_id: DEPT_ID, user_id: 'user-manager' }, error: null }),
      },
      ticket_watchers: {
        select: () => ({ data: null, error: null }),
      },
      ticket_assignments: {
        select: () => ({ data: history, error: null }),
      },
    },
  });

  const service = new AssignmentService({
    supabaseAdmin: mockDb,
    notificationService: mockNotificationService,
    activityService: mockActivityService,
  });
  const result = await service.getAssignmentHistory(
    { id: 'user-manager', role: 'MANAGER', employeeId: MANAGER_ID },
    TICKET_ID
  );

  assert.equal(result.success, true);
  assert.equal(result.data.length, 2);
});

test('Reassign ticket logs reassignment and updates assignee', async () => {
  const mockDb = createMockSupabase({
    handlers: {
      tickets: {
        select: () => ({ data: ticket, error: null }),
        update: ({ payload }) => ({ data: { ...ticket, ...payload }, error: null }),
      },
      employees: {
        select: ({ filters }) => {
          const idFilter = filters.find((f) => f.column === 'id');
          if (idFilter?.value === MANAGER_ID) {
            return { data: { department_id: DEPT_ID, user_id: 'user-manager' }, error: null };
          }
          return { data: { user_id: 'user-new-assignee' }, error: null };
        },
      },
      ticket_watchers: {
        select: () => ({ data: null, error: null }),
      },
      ticket_assignments: {
        update: () => ({ data: null, error: null }),
        insert: () => ({ data: { id: 'assign-2', assignee_id: NEW_ASSIGNEE_ID }, error: null }),
      },
      ticket_activities: {
        insert: () => ({ data: { id: 'activity-2' }, error: null }),
      },
    },
  });

  const service = new AssignmentService({
    supabaseAdmin: mockDb,
    notificationService: mockNotificationService,
    activityService: mockActivityService,
  });

  const result = await service.reassignTicket(
    { id: 'user-manager', role: 'MANAGER', employeeId: MANAGER_ID },
    TICKET_ID,
    { assignee_id: NEW_ASSIGNEE_ID }
  );

  assert.equal(result.success, true);
  assert.equal(result.data.ticket.assignee_id, NEW_ASSIGNEE_ID);
});
