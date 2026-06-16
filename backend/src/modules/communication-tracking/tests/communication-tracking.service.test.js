const test = require('node:test');
const assert = require('node:assert/strict');
const CommunicationTrackingService = require('../services/communication-tracking.service');
const AppError = require('../../../utils/app-error');
const { createMockSupabase } = require('../../ticketing/tests/helpers/mock-supabase');

const TICKET_ID = '550e8400-e29b-41d4-a716-446655440001';
const EMPLOYEE_ID = '550e8400-e29b-41d4-a716-446655440010';
const MANAGER_ID = '550e8400-e29b-41d4-a716-446655440011';
const HR_ID = '550e8400-e29b-41d4-a716-446655440012';
const ADMIN_ID = '550e8400-e29b-41d4-a716-446655440013';
const OTHER_ID = '550e8400-e29b-41d4-a716-446655440014';
const DEPT_ID = '550e8400-e29b-41d4-a716-446655440020';

const baseTicket = {
  id: TICKET_ID,
  ticket_number: 'TKT-2026-00001',
  title: 'VPN issue',
  status: 'OPEN',
  department_id: DEPT_ID,
  requester_id: EMPLOYEE_ID,
  assignee_id: OTHER_ID,
  created_at: '2026-06-01T10:00:00.000Z',
};

function buildDb(overrides = {}) {
  const ticket = overrides.ticket ?? baseTicket;
  const comms = overrides.comms ?? [];
  const timeline = overrides.timeline ?? [];
  const assignmentHistory = overrides.assignmentHistory ?? [];
  const feedback = overrides.feedback ?? [];

  return createMockSupabase({
    handlers: {
      tickets: {
        select: ({ filters }) => {
          const inFilter = filters.find((f) => f.type === 'in');
          const idFilter = filters.find((f) => f.type === 'eq' && f.column === 'id');
          if (inFilter) {
            return { data: [ticket], error: null };
          }
          if (idFilter) {
            return { data: ticket, error: null };
          }
          if (filters.some((f) => f.type === 'or')) {
            return { data: [ticket], error: null };
          }
          return { data: ticket, error: null };
        },
      },
      employees: {
        select: ({ filters }) => {
          const idFilter = filters.find((f) => f.column === 'id');
          const dept = idFilter?.value === MANAGER_ID ? DEPT_ID : DEPT_ID;
          return { data: { department_id: dept }, error: null };
        },
      },
      ticket_communications: {
        insert: ({ payload }) => {
          const row = { id: `comm-${comms.length + 1}`, ...payload, created_at: new Date().toISOString() };
          comms.push(row);
          return { data: row, error: null };
        },
        select: () => ({ data: comms, error: null }),
      },
      ticket_call_logs: {
        insert: ({ payload }) => {
          const row = { id: 'call-1', ...payload, created_at: new Date().toISOString() };
          return { data: row, error: null };
        },
        select: () => ({ data: [], error: null }),
      },
      ticket_email_logs: {
        insert: ({ payload }) => {
          const row = { id: 'email-1', ...payload, created_at: new Date().toISOString() };
          return { data: row, error: null };
        },
        select: () => ({ data: [], error: null }),
      },
      ticket_activity_timeline: {
        insert: ({ payload }) => {
          const row = { id: `tl-${timeline.length + 1}`, ...payload, created_at: new Date().toISOString() };
          timeline.push(row);
          return { data: row, error: null };
        },
        select: () => ({ data: timeline, error: null }),
      },
      ticket_assignment_history: {
        select: () => ({ data: assignmentHistory, error: null }),
      },
      ticket_feedback: {
        select: () => ({ data: feedback, error: null }),
      },
      ticket_sla_escalation_events: {
        select: () => ({ data: [], error: null }),
      },
      departments: {
        select: () => ({ data: [{ id: DEPT_ID, name: 'IT' }], error: null }),
      },
    },
  });
}

test('requester can add comment', async () => {
  const service = new CommunicationTrackingService({ supabaseAdmin: buildDb() });
  const result = await service.addComment(
    { role: 'EMPLOYEE', employeeId: EMPLOYEE_ID },
    { ticket_id: TICKET_ID, message: 'Update please' }
  );
  assert.equal(result.success, true);
  assert.equal(result.data.communication.communication_type, 'COMMENT');
});

test('assignee can add comment', async () => {
  const service = new CommunicationTrackingService({ supabaseAdmin: buildDb() });
  const result = await service.addComment(
    { role: 'EMPLOYEE', employeeId: OTHER_ID },
    { ticket_id: TICKET_ID, message: 'Working on it' }
  );
  assert.equal(result.success, true);
});

test('manager in department can add comment', async () => {
  const service = new CommunicationTrackingService({ supabaseAdmin: buildDb() });
  const result = await service.addComment(
    { role: 'MANAGER', employeeId: MANAGER_ID },
    { ticket_id: TICKET_ID, message: 'Manager note' }
  );
  assert.equal(result.success, true);
});

test('admin can add comment', async () => {
  const service = new CommunicationTrackingService({ supabaseAdmin: buildDb() });
  const result = await service.addComment(
    { role: 'ADMIN', employeeId: ADMIN_ID },
    { ticket_id: TICKET_ID, message: 'Admin note' }
  );
  assert.equal(result.success, true);
});

test('HR can add comment', async () => {
  const service = new CommunicationTrackingService({ supabaseAdmin: buildDb() });
  const result = await service.addComment(
    { role: 'HR', employeeId: HR_ID },
    { ticket_id: TICKET_ID, message: 'HR note' }
  );
  assert.equal(result.success, true);
});

test('unrelated employee cannot add comment', async () => {
  const service = new CommunicationTrackingService({ supabaseAdmin: buildDb() });
  await assert.rejects(
    () => service.addComment(
      { role: 'EMPLOYEE', employeeId: '550e8400-e29b-41d4-a716-446655440099' },
      { ticket_id: TICKET_ID, message: 'Nope' }
    ),
    (err) => err instanceof AppError && err.statusCode === 403
  );
});

test('comment creates timeline event', async () => {
  const db = buildDb();
  const service = new CommunicationTrackingService({ supabaseAdmin: db });
  const result = await service.addComment(
    { role: 'EMPLOYEE', employeeId: EMPLOYEE_ID },
    { ticket_id: TICKET_ID, message: 'Timeline test' }
  );
  assert.equal(result.data.timeline.event_type, 'COMMENT_ADDED');
});

test('internal comment sets INTERNAL direction', async () => {
  const service = new CommunicationTrackingService({ supabaseAdmin: buildDb() });
  const result = await service.addComment(
    { role: 'MANAGER', employeeId: MANAGER_ID },
    { ticket_id: TICKET_ID, message: 'Internal', visibility: 'INTERNAL' }
  );
  assert.equal(result.data.communication.direction, 'INTERNAL');
});

test('addChat creates CHAT communication', async () => {
  const service = new CommunicationTrackingService({ supabaseAdmin: buildDb() });
  const result = await service.addChat(
    { role: 'EMPLOYEE', employeeId: EMPLOYEE_ID },
    { ticket_id: TICKET_ID, message: 'Chat hello' }
  );
  assert.equal(result.data.communication.communication_type, 'CHAT');
});

test('addInternalNote creates SYSTEM_NOTE', async () => {
  const service = new CommunicationTrackingService({ supabaseAdmin: buildDb() });
  const result = await service.addInternalNote(
    { role: 'MANAGER', employeeId: MANAGER_ID },
    { ticket_id: TICKET_ID, message: 'Private note' }
  );
  assert.equal(result.data.communication.visibility, 'INTERNAL');
});

test('logEmail creates email log and timeline', async () => {
  const service = new CommunicationTrackingService({ supabaseAdmin: buildDb() });
  const result = await service.logEmail(
    { role: 'EMPLOYEE', employeeId: OTHER_ID },
    {
      ticket_id: TICKET_ID,
      sender: 'agent@corp.com',
      recipient: 'user@corp.com',
      subject: 'Update',
      body: 'Your ticket update',
      status: 'SENT',
    }
  );
  assert.equal(result.data.timeline.event_type, 'EMAIL_SENT');
});

test('logEmail RECEIVED maps to EMAIL_RECEIVED event', async () => {
  const service = new CommunicationTrackingService({ supabaseAdmin: buildDb() });
  const result = await service.logEmail(
    { role: 'EMPLOYEE', employeeId: OTHER_ID },
    {
      ticket_id: TICKET_ID,
      sender: 'user@corp.com',
      recipient: 'agent@corp.com',
      subject: 'Re:',
      body: 'Thanks',
      status: 'RECEIVED',
    }
  );
  assert.equal(result.data.timeline.event_type, 'EMAIL_RECEIVED');
});

test('logCall creates call log and timeline', async () => {
  const service = new CommunicationTrackingService({ supabaseAdmin: buildDb() });
  const result = await service.logCall(
    { role: 'EMPLOYEE', employeeId: OTHER_ID },
    {
      ticket_id: TICKET_ID,
      call_start_at: '2026-06-15T10:00:00.000Z',
      call_end_at: '2026-06-15T10:05:00.000Z',
      outcome: 'CONNECTED',
      call_summary: 'Discussed issue',
    }
  );
  assert.equal(result.data.timeline.event_type, 'CALL_LOGGED');
  assert.equal(result.data.callLog.duration_seconds, 300);
});

test('getTicketCommunications returns grouped data', async () => {
  const service = new CommunicationTrackingService({ supabaseAdmin: buildDb({ comms: [{ id: 'c1', ticket_id: TICKET_ID }] }) });
  const result = await service.getTicketCommunications(
    { role: 'ADMIN', employeeId: ADMIN_ID },
    TICKET_ID
  );
  assert.equal(result.data.communications.length, 1);
});

test('getTicketTimeline merges assignment history', async () => {
  const service = new CommunicationTrackingService({
    supabaseAdmin: buildDb({
      assignmentHistory: [{
        id: 'h1',
        ticket_id: TICKET_ID,
        old_assignee: null,
        new_assignee: OTHER_ID,
        changed_by: MANAGER_ID,
        changed_at: '2026-06-02T10:00:00.000Z',
      }],
    }),
  });
  const result = await service.getTicketTimeline({ role: 'ADMIN', employeeId: ADMIN_ID }, TICKET_ID);
  assert.ok(result.data.events.some((e) => e.event_type === 'ASSIGNED'));
});

test('getTicketTimeline merges feedback events', async () => {
  const service = new CommunicationTrackingService({
    supabaseAdmin: buildDb({
      feedback: [{
        id: 'f1',
        ticket_id: TICKET_ID,
        rating: 5,
        submitted_by: EMPLOYEE_ID,
        submitted_at: '2026-06-10T10:00:00.000Z',
      }],
    }),
  });
  const result = await service.getTicketTimeline({ role: 'ADMIN', employeeId: ADMIN_ID }, TICKET_ID);
  assert.ok(result.data.events.some((e) => e.event_type === 'FEEDBACK_SUBMITTED'));
});

test('getAnalytics returns metrics for admin', async () => {
  const service = new CommunicationTrackingService({
    supabaseAdmin: buildDb({
      comms: [
        { id: 'c1', ticket_id: TICKET_ID, communication_type: 'COMMENT', created_at: '2026-06-01T10:00:00.000Z' },
        { id: 'c2', ticket_id: TICKET_ID, communication_type: 'CHAT', created_at: '2026-06-01T11:00:00.000Z' },
      ],
    }),
  });
  const result = await service.getAnalytics({ role: 'ADMIN', employeeId: ADMIN_ID }, {});
  assert.equal(result.data.totalCommunications, 2);
  assert.equal(result.data.commentsAdded, 1);
});

test('employee without profile cannot add comment', async () => {
  const service = new CommunicationTrackingService({ supabaseAdmin: buildDb() });
  await assert.rejects(
    () => service.addComment({ role: 'EMPLOYEE' }, { ticket_id: TICKET_ID, message: 'x' }),
    (err) => err instanceof AppError && err.statusCode === 403
  );
});

test('buildIntegratedTimeline sorts by created_at desc', () => {
  const service = new CommunicationTrackingService({ supabaseAdmin: buildDb() });
  const events = service.buildIntegratedTimelineEvents(TICKET_ID, {
    storedEvents: [{ id: '1', created_at: '2026-06-01T10:00:00.000Z', event_type: 'COMMENT_ADDED', event_data: {} }],
    assignmentHistory: [{ id: 'h1', changed_at: '2026-06-03T10:00:00.000Z', old_assignee: null, new_assignee: OTHER_ID, changed_by: MANAGER_ID }],
    feedbackRows: [],
    slaEscalations: [],
  });
  assert.equal(events[0].event_type, 'ASSIGNED');
});

test('reassignment history maps to REASSIGNED', async () => {
  const service = new CommunicationTrackingService({
    supabaseAdmin: buildDb({
      assignmentHistory: [{
        id: 'h2',
        old_assignee: OTHER_ID,
        new_assignee: MANAGER_ID,
        changed_by: ADMIN_ID,
        changed_at: '2026-06-04T10:00:00.000Z',
      }],
    }),
  });
  const result = await service.getTicketTimeline({ role: 'ADMIN', employeeId: ADMIN_ID }, TICKET_ID);
  assert.ok(result.data.events.some((e) => e.event_type === 'REASSIGNED'));
});
