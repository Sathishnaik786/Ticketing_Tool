const test = require('node:test');
const assert = require('node:assert/strict');
const TicketFeedbackService = require('../services/ticket-feedback.service');
const AppError = require('../../../utils/app-error');
const { createMockSupabase } = require('../../ticketing/tests/helpers/mock-supabase');

const TICKET_ID = '550e8400-e29b-41d4-a716-446655440001';
const EMPLOYEE_ID = '550e8400-e29b-41d4-a716-446655440010';
const MANAGER_ID = '550e8400-e29b-41d4-a716-446655440011';
const DEPT_ID = '550e8400-e29b-41d4-a716-446655440020';
const OTHER_DEPT_ID = '550e8400-e29b-41d4-a716-446655440021';
const FEEDBACK_ID = '550e8400-e29b-41d4-a716-446655440099';

const closedTicket = {
  id: TICKET_ID,
  status: 'CLOSED',
  requester_id: EMPLOYEE_ID,
  department_id: DEPT_ID,
  category_id: null,
  ticket_number: 'TKT-2026-00001',
  title: 'VPN issue',
};

const openTicket = { ...closedTicket, status: 'OPEN' };

function buildFeedbackDb({ ticket = closedTicket, existingFeedback = null, insertError = null } = {}) {
  const feedbackStore = existingFeedback ? [existingFeedback] : [];

  return createMockSupabase({
    handlers: {
      tickets: {
        select: ({ filters }) => {
          const idFilter = filters.find((f) => f.column === 'id');
          if (idFilter?.value === TICKET_ID) {
            return { data: ticket, error: null };
          }
          return { data: null, error: { code: 'PGRST116' } };
        },
      },
      ticket_feedback: {
        select: ({ filters, maybeSingle }) => {
          const ticketFilter = filters.find((f) => f.column === 'ticket_id');
          if (ticketFilter) {
            const found = feedbackStore.find((f) => f.ticket_id === ticketFilter.value);
            if (maybeSingle) {
              return { data: found || null, error: null };
            }
          }
          const submitterFilter = filters.find((f) => f.column === 'submitted_by');
          if (submitterFilter) {
            return {
              data: feedbackStore.filter((f) => f.submitted_by === submitterFilter.value),
              error: null,
            };
          }
          return { data: feedbackStore, error: null };
        },
        insert: ({ payload }) => {
          if (insertError) {
            return { data: null, error: insertError };
          }
          const record = {
            id: FEEDBACK_ID,
            ...payload,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          feedbackStore.push(record);
          return { data: record, error: null };
        },
      },
      employees: {
        select: ({ filters }) => {
          const idFilter = filters.find((f) => f.column === 'id');
          if (idFilter?.value === MANAGER_ID) {
            return { data: { department_id: DEPT_ID }, error: null };
          }
          if (idFilter?.value === EMPLOYEE_ID) {
            return { data: { department_id: DEPT_ID }, error: null };
          }
          return { data: { department_id: OTHER_DEPT_ID }, error: null };
        },
      },
    },
  });
}

const validPayload = {
  ticket_id: TICKET_ID,
  rating: 5,
  resolution_quality: 4,
  communication_quality: 5,
  response_time: 4,
  comments: 'Great support',
};

test('Requester can submit feedback for closed ticket', async () => {
  const service = new TicketFeedbackService({ supabaseAdmin: buildFeedbackDb() });
  const result = await service.submitFeedback(
    { id: 'user-1', role: 'EMPLOYEE', employeeId: EMPLOYEE_ID },
    validPayload
  );
  assert.equal(result.success, true);
  assert.equal(result.data.rating, 5);
});

test('Rejects feedback for open ticket', async () => {
  const service = new TicketFeedbackService({
    supabaseAdmin: buildFeedbackDb({ ticket: openTicket }),
  });
  await assert.rejects(
    () => service.submitFeedback(
      { id: 'user-1', role: 'EMPLOYEE', employeeId: EMPLOYEE_ID },
      validPayload
    ),
    (err) => err instanceof AppError && err.statusCode === 400
  );
});

test('Rejects feedback from non-requester', async () => {
  const service = new TicketFeedbackService({ supabaseAdmin: buildFeedbackDb() });
  await assert.rejects(
    () => service.submitFeedback(
      { id: 'user-2', role: 'EMPLOYEE', employeeId: MANAGER_ID },
      validPayload
    ),
    (err) => err instanceof AppError && err.statusCode === 403
  );
});

test('Rejects duplicate feedback', async () => {
  const existing = { id: FEEDBACK_ID, ticket_id: TICKET_ID, submitted_by: EMPLOYEE_ID, rating: 4 };
  const service = new TicketFeedbackService({
    supabaseAdmin: buildFeedbackDb({ existingFeedback: existing }),
  });
  await assert.rejects(
    () => service.submitFeedback(
      { id: 'user-1', role: 'EMPLOYEE', employeeId: EMPLOYEE_ID },
      validPayload
    ),
    (err) => err instanceof AppError && err.statusCode === 409
  );
});

test('Rejects invalid rating below range', async () => {
  const service = new TicketFeedbackService({ supabaseAdmin: buildFeedbackDb() });
  await assert.rejects(
    () => service.submitFeedback(
      { id: 'user-1', role: 'EMPLOYEE', employeeId: EMPLOYEE_ID },
      { ...validPayload, rating: 0 }
    ),
    (err) => err instanceof AppError && err.statusCode === 400
  );
});

test('Rejects invalid rating above range', async () => {
  const service = new TicketFeedbackService({ supabaseAdmin: buildFeedbackDb() });
  await assert.rejects(
    () => service.submitFeedback(
      { id: 'user-1', role: 'EMPLOYEE', employeeId: EMPLOYEE_ID },
      { ...validPayload, rating: 6 }
    ),
    (err) => err instanceof AppError && err.statusCode === 400
  );
});

test('Rejects comments exceeding 1000 characters', async () => {
  const service = new TicketFeedbackService({ supabaseAdmin: buildFeedbackDb() });
  await assert.rejects(
    () => service.submitFeedback(
      { id: 'user-1', role: 'EMPLOYEE', employeeId: EMPLOYEE_ID },
      { ...validPayload, comments: 'x'.repeat(1001) }
    ),
    (err) => err instanceof AppError && err.statusCode === 400
  );
});

test('Requester can view own feedback', async () => {
  const existing = {
    id: FEEDBACK_ID,
    ticket_id: TICKET_ID,
    submitted_by: EMPLOYEE_ID,
    rating: 5,
    resolution_quality: 5,
    communication_quality: 4,
    response_time: 4,
    submitted_at: new Date().toISOString(),
  };
  const service = new TicketFeedbackService({
    supabaseAdmin: buildFeedbackDb({ existingFeedback: existing }),
  });
  const result = await service.getFeedbackByTicketId(
    { id: 'user-1', role: 'EMPLOYEE', employeeId: EMPLOYEE_ID },
    TICKET_ID
  );
  assert.equal(result.data.rating, 5);
});

test('Admin can view feedback', async () => {
  const existing = {
    id: FEEDBACK_ID,
    ticket_id: TICKET_ID,
    submitted_by: EMPLOYEE_ID,
    rating: 3,
    resolution_quality: 3,
    communication_quality: 3,
    response_time: 3,
    submitted_at: new Date().toISOString(),
  };
  const service = new TicketFeedbackService({
    supabaseAdmin: buildFeedbackDb({ existingFeedback: existing }),
  });
  const result = await service.getFeedbackByTicketId(
    { id: 'admin', role: 'ADMIN', employeeId: 'admin-emp' },
    TICKET_ID
  );
  assert.equal(result.success, true);
});

test('HR can view feedback', async () => {
  const existing = {
    id: FEEDBACK_ID,
    ticket_id: TICKET_ID,
    submitted_by: EMPLOYEE_ID,
    rating: 4,
    resolution_quality: 4,
    communication_quality: 4,
    response_time: 4,
    submitted_at: new Date().toISOString(),
  };
  const service = new TicketFeedbackService({
    supabaseAdmin: buildFeedbackDb({ existingFeedback: existing }),
  });
  const result = await service.getFeedbackByTicketId(
    { id: 'hr', role: 'HR', employeeId: 'hr-emp' },
    TICKET_ID
  );
  assert.equal(result.success, true);
});

test('Manager can view department feedback', async () => {
  const existing = {
    id: FEEDBACK_ID,
    ticket_id: TICKET_ID,
    submitted_by: EMPLOYEE_ID,
    rating: 4,
    resolution_quality: 4,
    communication_quality: 4,
    response_time: 4,
    submitted_at: new Date().toISOString(),
  };
  const service = new TicketFeedbackService({
    supabaseAdmin: buildFeedbackDb({ existingFeedback: existing }),
  });
  const result = await service.getFeedbackByTicketId(
    { id: 'mgr', role: 'MANAGER', employeeId: MANAGER_ID },
    TICKET_ID
  );
  assert.equal(result.success, true);
});

test('Employee cannot view others feedback', async () => {
  const existing = {
    id: FEEDBACK_ID,
    ticket_id: TICKET_ID,
    submitted_by: EMPLOYEE_ID,
    rating: 4,
    resolution_quality: 4,
    communication_quality: 4,
    response_time: 4,
    submitted_at: new Date().toISOString(),
  };
  const service = new TicketFeedbackService({
    supabaseAdmin: buildFeedbackDb({ existingFeedback: existing }),
  });
  await assert.rejects(
    () => service.getFeedbackByTicketId(
      { id: 'other', role: 'EMPLOYEE', employeeId: 'other-emp' },
      TICKET_ID
    ),
    (err) => err instanceof AppError && err.statusCode === 403
  );
});

test('Returns 404 when feedback not found', async () => {
  const service = new TicketFeedbackService({ supabaseAdmin: buildFeedbackDb() });
  await assert.rejects(
    () => service.getFeedbackByTicketId(
      { id: 'admin', role: 'ADMIN', employeeId: 'admin-emp' },
      TICKET_ID
    ),
    (err) => err instanceof AppError && err.statusCode === 404
  );
});

test('Admin can access metrics', async () => {
  const service = new TicketFeedbackService({ supabaseAdmin: buildFeedbackDb() });
  const result = await service.getMetrics({ id: 'admin', role: 'ADMIN', employeeId: 'a' }, {});
  assert.equal(result.success, true);
  assert.equal(typeof result.data.csatPercentage, 'number');
});

test('Employee cannot access metrics', async () => {
  const service = new TicketFeedbackService({ supabaseAdmin: buildFeedbackDb() });
  await assert.rejects(
    () => service.getMetrics({ id: 'emp', role: 'EMPLOYEE', employeeId: EMPLOYEE_ID }, {}),
    (err) => err instanceof AppError && err.statusCode === 403
  );
});

test('Manager can access metrics', async () => {
  const service = new TicketFeedbackService({ supabaseAdmin: buildFeedbackDb() });
  const result = await service.getMetrics({ id: 'mgr', role: 'MANAGER', employeeId: MANAGER_ID }, {});
  assert.equal(result.success, true);
});

test('Metrics compute CSAT percentage correctly', () => {
  const service = new TicketFeedbackService({ supabaseAdmin: buildFeedbackDb() });
  const metrics = service.buildMetricsResponse([
    { rating: 5, resolution_quality: 5, communication_quality: 5, response_time: 5, submitted_at: '2026-01-15T00:00:00Z', tickets: { departments: { name: 'IT' }, ticket_categories: { name: 'Hardware' } } },
    { rating: 4, resolution_quality: 4, communication_quality: 4, response_time: 4, submitted_at: '2026-02-15T00:00:00Z', tickets: { departments: { name: 'IT' }, ticket_categories: { name: 'Software' } } },
    { rating: 2, resolution_quality: 2, communication_quality: 2, response_time: 2, submitted_at: '2026-03-15T00:00:00Z', tickets: { departments: { name: 'HR' }, ticket_categories: { name: 'Policy' } } },
  ]);
  assert.equal(metrics.totalFeedback, 3);
  assert.equal(metrics.averageRating, 3.67);
  assert.equal(metrics.csatPercentage, 66.67);
  assert.equal(metrics.departmentWiseRating.length, 2);
  assert.equal(metrics.monthlyTrend.length, 3);
});

test('Employee submission count returns correct value', async () => {
  const mockDb = createMockSupabase({
    handlers: {
      ticket_feedback: {
        select: ({ filters, selectArgs }) => {
          const submitterFilter = filters.find((f) => f.column === 'submitted_by');
          if (submitterFilter?.value === EMPLOYEE_ID && selectArgs?.head) {
            return { data: null, error: null, count: 1 };
          }
          return { data: [], error: null, count: 0 };
        },
      },
    },
  });
  const service = new TicketFeedbackService({ supabaseAdmin: mockDb });
  const result = await service.getEmployeeSubmissionCount({
    id: 'user-1',
    role: 'EMPLOYEE',
    employeeId: EMPLOYEE_ID,
  });
  assert.equal(result.data.count, 1);
});

test('Rejects feedback without employee profile', async () => {
  const service = new TicketFeedbackService({ supabaseAdmin: buildFeedbackDb() });
  await assert.rejects(
    () => service.submitFeedback({ id: 'user-1', role: 'EMPLOYEE' }, validPayload),
    (err) => err instanceof AppError && err.statusCode === 403
  );
});

test('Rejects invalid ticket_id format', async () => {
  const service = new TicketFeedbackService({ supabaseAdmin: buildFeedbackDb() });
  await assert.rejects(
    () => service.submitFeedback(
      { id: 'user-1', role: 'EMPLOYEE', employeeId: EMPLOYEE_ID },
      { ...validPayload, ticket_id: 'not-a-uuid' }
    ),
    (err) => err instanceof AppError && err.statusCode === 400
  );
});
