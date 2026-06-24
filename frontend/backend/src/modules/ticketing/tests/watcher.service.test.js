const test = require('node:test');
const assert = require('node:assert/strict');
const WatcherService = require('../services/watcher.service');
const AppError = require('../../../utils/app-error');
const { createMockSupabase } = require('./helpers/mock-supabase');
const { mockActivityService } = require('./helpers/test-deps');

const TICKET_ID = '550e8400-e29b-41d4-a716-446655440001';
const EMPLOYEE_ID = '550e8400-e29b-41d4-a716-446655440010';
const DEPT_ID = '550e8400-e29b-41d4-a716-446655440020';

const ticket = {
  id: TICKET_ID,
  ticket_number: 'TKT-2026-00003',
  title: 'Access request',
  department_id: DEPT_ID,
  requester_id: '550e8400-e29b-41d4-a716-446655440099',
  assignee_id: EMPLOYEE_ID,
  status: 'ASSIGNED',
};

function buildWatcherDb(options = {}) {
  return createMockSupabase({
    handlers: {
      tickets: {
        select: () => ({ data: ticket, error: null }),
      },
      employees: {
        select: ({ filters }) => {
          const idFilter = filters.find((f) => f.column === 'id');
          if (idFilter?.value === EMPLOYEE_ID) {
            return { data: { department_id: DEPT_ID, user_id: 'user-employee' }, error: null };
          }
          return { data: { department_id: DEPT_ID }, error: null };
        },
      },
      ticket_watchers: {
        insert: () => ({
          data: { id: 'watch-1', ticket_id: TICKET_ID, employee_id: EMPLOYEE_ID },
          error: null,
        }),
        select: ({ filters }) => {
          const employeeFilter = filters.find((f) => f.column === 'employee_id');
          if (employeeFilter && options.isWatcher) {
            return { data: { id: 'watch-1' }, error: null };
          }
          if (options.listWatchers) {
            return {
              data: [{ id: 'watch-1', employee_id: EMPLOYEE_ID }],
              error: null,
            };
          }
          return { data: null, error: null };
        },
        delete: () => ({
          data: { id: 'watch-1', employee_id: EMPLOYEE_ID },
          error: null,
        }),
      },
      ticket_activities: {
        insert: () => ({ data: { id: 'activity-1' }, error: null }),
      },
    },
  });
}

test('Assignee can add self as watcher', async () => {
  const service = new WatcherService({
    supabaseAdmin: buildWatcherDb(),
    activityService: mockActivityService,
  });
  const result = await service.addWatcher(
    { id: 'user-employee', role: 'EMPLOYEE', employeeId: EMPLOYEE_ID },
    TICKET_ID
  );

  assert.equal(result.success, true);
  assert.equal(result.data.employee_id, EMPLOYEE_ID);
});

test('Watcher access allows ticket visibility through helper context', async () => {
  const ticketAccess = require('../services/ticket-access.helper');
  const mockDb = buildWatcherDb({ isWatcher: true });

  const context = await ticketAccess.buildAccessContext(
    mockDb,
    { employeeId: EMPLOYEE_ID },
    TICKET_ID
  );

  assert.equal(context.isWatcher, true);
});

test('Watcher list returns active watchers', async () => {
  const service = new WatcherService({ supabaseAdmin: buildWatcherDb({ listWatchers: true }) });
  const result = await service.listWatchers(
    { id: 'user-employee', role: 'EMPLOYEE', employeeId: EMPLOYEE_ID },
    TICKET_ID
  );

  assert.equal(result.success, true);
  assert.equal(result.data.length, 1);
});

test('Employee cannot remove another watcher', async () => {
  const service = new WatcherService({
    supabaseAdmin: buildWatcherDb(),
    activityService: mockActivityService,
  });

  await assert.rejects(
    () => service.removeWatcher(
      { id: 'user-employee', role: 'EMPLOYEE', employeeId: EMPLOYEE_ID },
      TICKET_ID,
      '550e8400-e29b-41d4-a716-446655440088'
    ),
    (error) => error instanceof AppError && error.statusCode === 403
  );
});
