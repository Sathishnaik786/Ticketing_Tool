const test = require('node:test');
const assert = require('node:assert/strict');
const CommentService = require('../services/comment.service');
const AppError = require('../../../utils/app-error');
const { createMockSupabase } = require('./helpers/mock-supabase');
const { mockNotificationService, mockActivityService } = require('./helpers/test-deps');

const TICKET_ID = '550e8400-e29b-41d4-a716-446655440001';
const EMPLOYEE_ID = '550e8400-e29b-41d4-a716-446655440010';
const MANAGER_ID = '550e8400-e29b-41d4-a716-446655440011';
const DEPT_ID = '550e8400-e29b-41d4-a716-446655440020';

const ticket = {
  id: TICKET_ID,
  ticket_number: 'TKT-2026-00001',
  title: 'Email issue',
  department_id: DEPT_ID,
  requester_id: EMPLOYEE_ID,
  assignee_id: MANAGER_ID,
  status: 'ASSIGNED',
};

function buildCommentDb(comments = []) {
  return createMockSupabase({
    handlers: {
      tickets: {
        select: () => ({ data: ticket, error: null }),
      },
      employees: {
        select: ({ filters }) => {
          const idFilter = filters.find((f) => f.column === 'id');
          if (idFilter?.value === MANAGER_ID) {
            return { data: { department_id: DEPT_ID, user_id: 'user-manager' }, error: null };
          }
          if (idFilter?.value === EMPLOYEE_ID) {
            return { data: { department_id: DEPT_ID, user_id: 'user-employee' }, error: null };
          }
          return { data: { user_id: 'user-other' }, error: null };
        },
      },
      ticket_watchers: {
        select: () => ({ data: null, error: null }),
      },
      ticket_comments: {
        insert: () => ({
          data: {
            id: 'comment-1',
            ticket_id: TICKET_ID,
            author_id: MANAGER_ID,
            content: 'Internal note',
            is_internal: true,
          },
          error: null,
        }),
        select: () => ({ data: comments, error: null }),
      },
      ticket_activities: {
        insert: () => ({ data: { id: 'activity-1' }, error: null }),
      },
    },
  });
}

test('Manager can create internal comment', async () => {
  const service = new CommentService({
    supabaseAdmin: buildCommentDb(),
    notificationService: mockNotificationService,
    activityService: mockActivityService,
  });

  const result = await service.createComment(
    { id: 'user-manager', role: 'MANAGER', employeeId: MANAGER_ID },
    TICKET_ID,
    { content: 'Internal note for support team', is_internal: true }
  );

  assert.equal(result.success, true);
  assert.equal(result.data.is_internal, true);
});

test('Employee cannot create internal comment', async () => {
  const service = new CommentService({
    supabaseAdmin: buildCommentDb(),
    notificationService: mockNotificationService,
    activityService: mockActivityService,
  });

  await assert.rejects(
    () => service.createComment(
      { id: 'user-employee', role: 'EMPLOYEE', employeeId: EMPLOYEE_ID },
      TICKET_ID,
      { content: 'Trying internal note', is_internal: true }
    ),
    (error) => error instanceof AppError && error.statusCode === 403
  );
});

test('Employee listComments excludes internal comments', async () => {
  const comments = [
    { id: 'c1', content: 'Public update', is_internal: false },
    { id: 'c2', content: 'Hidden note', is_internal: true },
  ];

  const service = new CommentService({
    supabaseAdmin: buildCommentDb(comments.filter((c) => !c.is_internal)),
    notificationService: { notifyTicketComment: async () => null },
  });

  const result = await service.listComments(
    { id: 'user-employee', role: 'EMPLOYEE', employeeId: EMPLOYEE_ID },
    TICKET_ID
  );

  assert.equal(result.success, true);
  assert.equal(result.data.length, 1);
  assert.equal(result.data[0].is_internal, false);
});
