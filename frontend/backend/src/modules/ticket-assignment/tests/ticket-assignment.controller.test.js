const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ticketAssignmentFeatureFlag = require('../middleware/ticket-assignment-feature-flag.middleware');

function makeResponse() {
  const res = { statusCode: 200, body: null, status(code) { this.statusCode = code; return this; }, json(p) { this.body = p; return this; } };
  return res;
}

test('Feature flag returns 503 when disabled', () => {
  const original = process.env.ENABLE_TICKET_ASSIGNMENTS;
  process.env.ENABLE_TICKET_ASSIGNMENTS = 'false';
  const res = makeResponse();
  let nextCalled = false;
  ticketAssignmentFeatureFlag({}, res, () => { nextCalled = true; });
  assert.equal(res.statusCode, 503);
  assert.equal(nextCalled, false);
  process.env.ENABLE_TICKET_ASSIGNMENTS = original;
});

test('Feature flag calls next when enabled', () => {
  const original = process.env.ENABLE_TICKET_ASSIGNMENTS;
  process.env.ENABLE_TICKET_ASSIGNMENTS = 'true';
  const res = makeResponse();
  let nextCalled = false;
  ticketAssignmentFeatureFlag({}, res, () => { nextCalled = true; });
  assert.equal(nextCalled, true);
  process.env.ENABLE_TICKET_ASSIGNMENTS = original;
});

test('Routes register auth middleware', () => {
  const source = fs.readFileSync(path.join(__dirname, '../ticket-assignment.routes.js'), 'utf8');
  assert.match(source, /authMiddleware/);
  assert.match(source, /ticketAssignmentFeatureFlag/);
});

test('Routes define POST / for assign', () => {
  const source = fs.readFileSync(path.join(__dirname, '../ticket-assignment.routes.js'), 'utf8');
  assert.match(source, /router\.post\('\/'/);
});

test('Routes define my-queue before param routes', () => {
  const source = fs.readFileSync(path.join(__dirname, '../ticket-assignment.routes.js'), 'utf8');
  assert.ok(source.indexOf("'/my-queue'") < source.indexOf("'/:ticketId/reassign'"));
});

test('Routes define team-queue endpoint', () => {
  const source = fs.readFileSync(path.join(__dirname, '../ticket-assignment.routes.js'), 'utf8');
  assert.match(source, /team-queue/);
});

test('Routes define unassigned endpoint', () => {
  const source = fs.readFileSync(path.join(__dirname, '../ticket-assignment.routes.js'), 'utf8');
  assert.match(source, /unassigned/);
});

test('Routes define analytics endpoint', () => {
  const source = fs.readFileSync(path.join(__dirname, '../ticket-assignment.routes.js'), 'utf8');
  assert.match(source, /analytics/);
});

test('Routes define reassign PUT endpoint', () => {
  const source = fs.readFileSync(path.join(__dirname, '../ticket-assignment.routes.js'), 'utf8');
  assert.match(source, /router\.put\('\/:ticketId\/reassign'/);
});

test('SQL migration creates ticket_assignment_history only', () => {
  const sql = fs.readFileSync(
    path.join(__dirname, '../../../../database/ticket_assignment_phase7_2.sql'),
    'utf8'
  );
  assert.match(sql, /ticket_assignment_history/);
  assert.doesNotMatch(sql, /CREATE TABLE IF NOT EXISTS ticket_assignments/);
});

test('Rollback drops ticket_assignment_history', () => {
  const sql = fs.readFileSync(
    path.join(__dirname, '../../../../database/ticket_assignment_phase7_2_rollback.sql'),
    'utf8'
  );
  assert.match(sql, /DROP TABLE IF EXISTS ticket_assignment_history/);
});
