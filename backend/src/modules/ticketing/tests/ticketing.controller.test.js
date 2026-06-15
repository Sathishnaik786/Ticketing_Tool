const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const AppError = require('../../../utils/app-error');
const TicketingController = require('../ticketing.controller');
const ticketingFeatureFlag = require('../middleware/ticketing-feature-flag.middleware');

const TICKET_ID = '550e8400-e29b-41d4-a716-446655440001';
const USER = {
  id: 'user-1',
  role: 'EMPLOYEE',
  employeeId: '550e8400-e29b-41d4-a716-446655440010',
};

function createController(overrides = {}) {
  return new TicketingController({
    ticketService: {},
    commentService: {},
    attachmentService: {},
    assignmentService: {},
    watcherService: {},
    activityService: {},
    slaService: {},
    ...overrides,
  });
}

function makeResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

function makeRequest(overrides = {}) {
  return {
    user: USER,
    params: { ticketId: TICKET_ID },
    query: {},
    body: {},
    ...overrides,
  };
}

test('ticketing routes apply authMiddleware at router level', () => {
  const routesPath = path.join(__dirname, '../ticketing.routes.js');
  const source = fs.readFileSync(routesPath, 'utf8');
  assert.match(source, /router\.use\(authMiddleware\)/);
});

test('feature flag returns 503 when ENABLE_TICKETING is not true', () => {
  const previous = process.env.ENABLE_TICKETING;
  process.env.ENABLE_TICKETING = 'false';

  const res = makeResponse();
  let nextCalled = false;

  ticketingFeatureFlag(makeRequest(), res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 503);
  assert.deepEqual(res.body, {
    success: false,
    message: 'Ticketing module disabled',
  });

  process.env.ENABLE_TICKETING = previous;
});

test('feature flag calls next when ENABLE_TICKETING is true', () => {
  const previous = process.env.ENABLE_TICKETING;
  process.env.ENABLE_TICKETING = 'true';

  const res = makeResponse();
  let nextCalled = false;

  ticketingFeatureFlag(makeRequest(), res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  process.env.ENABLE_TICKETING = previous;
});

test('getTicketById returns 200 on success', async () => {
  const controller = createController({
    ticketService: {
      getTicketById: async () => ({
        success: true,
        data: { id: TICKET_ID, title: 'Test ticket' },
      }),
    },
  });

  const req = makeRequest();
  const res = makeResponse();
  let errorPassed = null;

  await controller.getTicketById(req, res, (err) => {
    errorPassed = err;
  });

  assert.equal(errorPassed, null);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.id, TICKET_ID);
});

test('getTicketById forwards 403 AppError to next', async () => {
  const controller = createController({
    ticketService: {
      getTicketById: async () => {
        throw AppError.forbidden('Access denied');
      },
    },
  });

  const req = makeRequest();
  const res = makeResponse();
  let errorPassed = null;

  await controller.getTicketById(req, res, (err) => {
    errorPassed = err;
  });

  assert.ok(errorPassed instanceof AppError);
  assert.equal(errorPassed.statusCode, 403);
});

test('getTicketById forwards 404 AppError to next', async () => {
  const controller = createController({
    ticketService: {
      getTicketById: async () => {
        throw AppError.notFound('Ticket not found');
      },
    },
  });

  const req = makeRequest();
  const res = makeResponse();
  let errorPassed = null;

  await controller.getTicketById(req, res, (err) => {
    errorPassed = err;
  });

  assert.ok(errorPassed instanceof AppError);
  assert.equal(errorPassed.statusCode, 404);
});

test('createTicket forwards 400 validation AppError to next', async () => {
  const controller = createController({
    ticketService: {
      createTicket: async () => {
        throw AppError.badRequest('Create ticket validation failed', [
          { path: 'title', message: 'Too short' },
        ]);
      },
    },
  });

  const req = makeRequest({ body: { title: 'x' } });
  const res = makeResponse();
  let errorPassed = null;

  await controller.createTicket(req, res, (err) => {
    errorPassed = err;
  });

  assert.ok(errorPassed instanceof AppError);
  assert.equal(errorPassed.statusCode, 400);
});

test('assignTicket returns 200 on success', async () => {
  const controller = createController({
    assignmentService: {
      assignTicket: async () => ({
        success: true,
        data: { ticket: { status: 'ASSIGNED' } },
      }),
    },
  });

  const req = makeRequest({
    body: { assignee_id: '550e8400-e29b-41d4-a716-446655440013' },
  });
  const res = makeResponse();
  let errorPassed = null;

  await controller.assignTicket(req, res, (err) => {
    errorPassed = err;
  });

  assert.equal(errorPassed, null);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.data.ticket.status, 'ASSIGNED');
});

test('createAttachment returns 400 when file missing', async () => {
  const controller = createController({
    attachmentService: {
      createAttachment: async () => ({ success: true, data: {} }),
    },
  });

  const req = makeRequest({ file: null });
  const res = makeResponse();
  let errorPassed = null;

  await controller.createAttachment(req, res, (err) => {
    errorPassed = err;
  });

  assert.ok(errorPassed instanceof AppError);
  assert.equal(errorPassed.statusCode, 400);
});

test('getTimeline verifies ticket access before loading activities', async () => {
  let ticketLookupCalled = false;
  let timelineCalled = false;

  const controller = createController({
    ticketService: {
      getTicketById: async () => {
        ticketLookupCalled = true;
        return { success: true, data: { id: TICKET_ID } };
      },
    },
    activityService: {
      getTimeline: async () => {
        timelineCalled = true;
        return { success: true, data: [], meta: { page: 1, limit: 50, total: 0, pages: 0 } };
      },
    },
  });

  const req = makeRequest();
  const res = makeResponse();

  await controller.getTimeline(req, res, () => {});

  assert.equal(ticketLookupCalled, true);
  assert.equal(timelineCalled, true);
  assert.equal(res.statusCode, 200);
});

test('getSlaDetails returns combined SLA payload', async () => {
  const controller = createController({
    ticketService: {
      getTicketById: async () => ({
        success: true,
        data: {
          id: TICKET_ID,
          priority: 'HIGH',
          department_id: null,
          category_id: null,
          sla_response_due_at: '2026-01-01T00:30:00.000Z',
          sla_resolution_due_at: '2026-01-01T08:00:00.000Z',
          sla_response_breached: false,
          sla_resolution_breached: false,
        },
      }),
    },
    slaService: {
      resolveDueDates: async () => ({
        success: true,
        data: {
          rule: { priority: 'HIGH' },
          dueDates: {
            sla_response_due_at: '2026-01-01T00:30:00.000Z',
            sla_resolution_due_at: '2026-01-01T08:00:00.000Z',
          },
        },
      }),
    },
  });

  const req = makeRequest();
  const res = makeResponse();

  await controller.getSlaDetails(req, res, () => {});

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.ticket_id, TICKET_ID);
  assert.equal(res.body.data.applicable_rule.priority, 'HIGH');
});
