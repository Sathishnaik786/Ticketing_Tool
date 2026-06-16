const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const communicationTrackingFeatureFlag = require('../middleware/communication-tracking-feature-flag.middleware');

function makeResponse() {
  const res = {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(p) { this.body = p; return this; },
  };
  return res;
}

test('Feature flag returns 503 when disabled', () => {
  const original = process.env.ENABLE_COMMUNICATION_TRACKING;
  process.env.ENABLE_COMMUNICATION_TRACKING = 'false';
  const res = makeResponse();
  let nextCalled = false;
  communicationTrackingFeatureFlag({}, res, () => { nextCalled = true; });
  assert.equal(res.statusCode, 503);
  assert.equal(nextCalled, false);
  process.env.ENABLE_COMMUNICATION_TRACKING = original;
});

test('Routes register auth middleware', () => {
  const source = fs.readFileSync(path.join(__dirname, '../routes/communication-tracking.routes.js'), 'utf8');
  assert.match(source, /authMiddleware/);
  assert.match(source, /communicationTrackingFeatureFlag/);
});

test('Routes define POST /comment', () => {
  const source = fs.readFileSync(path.join(__dirname, '../routes/communication-tracking.routes.js'), 'utf8');
  assert.match(source, /router\.post\('\/comment'/);
});

test('Routes define POST /chat', () => {
  const source = fs.readFileSync(path.join(__dirname, '../routes/communication-tracking.routes.js'), 'utf8');
  assert.match(source, /router\.post\('\/chat'/);
});

test('Routes define POST /email', () => {
  const source = fs.readFileSync(path.join(__dirname, '../routes/communication-tracking.routes.js'), 'utf8');
  assert.match(source, /router\.post\('\/email'/);
});

test('Routes define POST /call-log', () => {
  const source = fs.readFileSync(path.join(__dirname, '../routes/communication-tracking.routes.js'), 'utf8');
  assert.match(source, /router\.post\('\/call-log'/);
});

test('Routes define GET /ticket/:ticketId', () => {
  const source = fs.readFileSync(path.join(__dirname, '../routes/communication-tracking.routes.js'), 'utf8');
  assert.match(source, /router\.get\('\/ticket\/:ticketId'/);
});

test('Routes define GET /timeline/:ticketId', () => {
  const source = fs.readFileSync(path.join(__dirname, '../routes/communication-tracking.routes.js'), 'utf8');
  assert.match(source, /router\.get\('\/timeline\/:ticketId'/);
});

test('Routes define GET /analytics', () => {
  const source = fs.readFileSync(path.join(__dirname, '../routes/communication-tracking.routes.js'), 'utf8');
  assert.match(source, /router\.get\('\/analytics'/);
});

test('SQL migration creates four new tables only', () => {
  const sql = fs.readFileSync(
    path.join(__dirname, '../../../../database/ticket_communication_phase7_4.sql'),
    'utf8'
  );
  assert.match(sql, /ticket_communications/);
  assert.match(sql, /ticket_call_logs/);
  assert.match(sql, /ticket_email_logs/);
  assert.match(sql, /ticket_activity_timeline/);
  assert.doesNotMatch(sql, /ALTER TABLE ticket_comments/);
});

test('Rollback drops phase 7.4 tables', () => {
  const sql = fs.readFileSync(
    path.join(__dirname, '../../../../database/ticket_communication_phase7_4_rollback.sql'),
    'utf8'
  );
  assert.match(sql, /DROP TABLE IF EXISTS ticket_activity_timeline/);
  assert.match(sql, /DROP TABLE IF EXISTS ticket_communications/);
});
