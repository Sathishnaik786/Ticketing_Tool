const test = require('node:test');
const assert = require('node:assert/strict');
const CommunicationTrackingService = require('../services/communication-tracking.service');
const AppError = require('../../../utils/app-error');
const { createMockSupabase } = require('../../ticketing/tests/helpers/mock-supabase');

const TICKET_ID = '550e8400-e29b-41d4-a716-446655440001';
const EMPLOYEE_ID = '550e8400-e29b-41d4-a716-446655440010';
const MANAGER_ID = '550e8400-e29b-41d4-a716-446655440011';
const OTHER_DEPT_EMP = '550e8400-e29b-41d4-a716-446655440099';
const DEPT_ID = '550e8400-e29b-41d4-a716-446655440020';
const OTHER_DEPT = '550e8400-e29b-41d4-a716-446655440021';

const ticket = {
  id: TICKET_ID,
  department_id: DEPT_ID,
  requester_id: EMPLOYEE_ID,
  assignee_id: null,
};

function buildDb() {
  return createMockSupabase({
    handlers: {
      tickets: {
        select: () => ({ data: ticket, error: null }),
      },
      employees: {
        select: ({ filters }) => {
          const id = filters.find((f) => f.column === 'id')?.value;
          if (id === MANAGER_ID) return { data: { department_id: DEPT_ID }, error: null };
          if (id === OTHER_DEPT_EMP) return { data: { department_id: OTHER_DEPT }, error: null };
          return { data: { department_id: DEPT_ID }, error: null };
        },
      },
      ticket_communications: {
        insert: ({ payload }) => ({ data: { id: 'c1', ...payload }, error: null }),
        select: () => ({ data: [], error: null }),
      },
      ticket_activity_timeline: {
        insert: ({ payload }) => ({ data: { id: 't1', ...payload }, error: null }),
        select: () => ({ data: [], error: null }),
      },
      ticket_call_logs: { insert: ({ payload }) => ({ data: { id: 'cl1', ...payload }, error: null }), select: () => ({ data: [], error: null }) },
      ticket_email_logs: { insert: ({ payload }) => ({ data: { id: 'el1', ...payload }, error: null }), select: () => ({ data: [], error: null }) },
      ticket_assignment_history: { select: () => ({ data: [], error: null }) },
      ticket_feedback: { select: () => ({ data: [], error: null }) },
      ticket_sla_escalation_events: { select: () => ({ data: [], error: null }) },
      departments: { select: () => ({ data: [], error: null }) },
    },
  });
}

test('RBAC: requester can view communications', async () => {
  const service = new CommunicationTrackingService({ supabaseAdmin: buildDb() });
  const result = await service.getTicketCommunications({ role: 'EMPLOYEE', employeeId: EMPLOYEE_ID }, TICKET_ID);
  assert.equal(result.success, true);
});

test('RBAC: manager same department can view', async () => {
  const service = new CommunicationTrackingService({ supabaseAdmin: buildDb() });
  const result = await service.getTicketCommunications({ role: 'MANAGER', employeeId: MANAGER_ID }, TICKET_ID);
  assert.equal(result.success, true);
});

test('RBAC: manager other department denied', async () => {
  const service = new CommunicationTrackingService({ supabaseAdmin: buildDb() });
  await assert.rejects(
    () => service.getTicketCommunications({ role: 'MANAGER', employeeId: OTHER_DEPT_EMP }, TICKET_ID),
    (err) => err instanceof AppError && err.statusCode === 403
  );
});

test('RBAC: HR can view all', async () => {
  const service = new CommunicationTrackingService({ supabaseAdmin: buildDb() });
  const result = await service.getTicketCommunications({ role: 'HR', employeeId: '550e8400-e29b-41d4-a716-446655440012' }, TICKET_ID);
  assert.equal(result.success, true);
});

test('RBAC: SUPER_ADMIN can view all', async () => {
  const service = new CommunicationTrackingService({ supabaseAdmin: buildDb() });
  const result = await service.getTicketCommunications({ role: 'SUPER_ADMIN', employeeId: '550e8400-e29b-41d4-a716-446655440015' }, TICKET_ID);
  assert.equal(result.success, true);
});

test('RBAC: unrelated employee denied timeline', async () => {
  const service = new CommunicationTrackingService({ supabaseAdmin: buildDb() });
  await assert.rejects(
    () => service.getTicketTimeline({ role: 'EMPLOYEE', employeeId: OTHER_DEPT_EMP }, TICKET_ID),
    (err) => err instanceof AppError && err.statusCode === 403
  );
});

test('RBAC: admin can access analytics', async () => {
  const service = new CommunicationTrackingService({ supabaseAdmin: buildDb() });
  const result = await service.getAnalytics({ role: 'ADMIN', employeeId: '550e8400-e29b-41d4-a716-446655440013' }, {});
  assert.equal(result.success, true);
});

test('RBAC: manager can access analytics', async () => {
  const service = new CommunicationTrackingService({ supabaseAdmin: buildDb() });
  const result = await service.getAnalytics({ role: 'MANAGER', employeeId: MANAGER_ID }, {});
  assert.equal(result.success, true);
});

test('RBAC: employee can access scoped analytics', async () => {
  const service = new CommunicationTrackingService({ supabaseAdmin: buildDb() });
  const result = await service.getAnalytics({ role: 'EMPLOYEE', employeeId: EMPLOYEE_ID }, {});
  assert.equal(result.success, true);
});

test('RBAC: employee can log call on own ticket', async () => {
  const db = buildDb();
  const service = new CommunicationTrackingService({ supabaseAdmin: db });
  const result = await service.logCall(
    { role: 'EMPLOYEE', employeeId: EMPLOYEE_ID },
    { ticket_id: TICKET_ID, call_start_at: '2026-06-15T10:00:00.000Z' }
  );
  assert.equal(result.success, true);
});
