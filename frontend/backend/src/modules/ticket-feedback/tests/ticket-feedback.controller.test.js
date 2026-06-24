const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ticketFeedbackFeatureFlag = require('../middleware/ticket-feedback-feature-flag.middleware');

function makeRequest() {
  return { headers: {} };
}

function makeResponse() {
  const res = {
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
  return res;
}

test('Feature flag middleware returns 503 when disabled', () => {
  const original = process.env.ENABLE_TICKET_FEEDBACK;
  process.env.ENABLE_TICKET_FEEDBACK = 'false';
  const req = makeRequest();
  const res = makeResponse();
  let nextCalled = false;

  ticketFeedbackFeatureFlag(req, res, () => { nextCalled = true; });

  assert.equal(res.statusCode, 503);
  assert.equal(res.body.success, false);
  assert.equal(nextCalled, false);
  process.env.ENABLE_TICKET_FEEDBACK = original;
});

test('Feature flag middleware calls next when enabled', () => {
  const original = process.env.ENABLE_TICKET_FEEDBACK;
  process.env.ENABLE_TICKET_FEEDBACK = 'true';
  const req = makeRequest();
  const res = makeResponse();
  let nextCalled = false;

  ticketFeedbackFeatureFlag(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, true);
  process.env.ENABLE_TICKET_FEEDBACK = original;
});

test('Routes file registers auth middleware', () => {
  const routesPath = path.join(__dirname, '../routes/ticket-feedback.routes.js');
  const source = fs.readFileSync(routesPath, 'utf8');
  assert.match(source, /authMiddleware/);
  assert.match(source, /ticketFeedbackFeatureFlag/);
});

test('Routes file defines POST / endpoint', () => {
  const routesPath = path.join(__dirname, '../routes/ticket-feedback.routes.js');
  const source = fs.readFileSync(routesPath, 'utf8');
  assert.match(source, /router\.post\('\/'/);
});

test('Routes file defines GET /metrics before ticket param route', () => {
  const routesPath = path.join(__dirname, '../routes/ticket-feedback.routes.js');
  const source = fs.readFileSync(routesPath, 'utf8');
  const metricsIndex = source.indexOf("'/metrics'");
  const ticketIndex = source.indexOf("'/ticket/:ticketId'");
  assert.ok(metricsIndex > -1 && ticketIndex > -1);
  assert.ok(metricsIndex < ticketIndex);
});
