const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function mockRes() {
  const res = { statusCode: 200, body: null };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (payload) => {
    res.body = payload;
    return res;
  };
  return res;
}

test('routes register auth middleware', () => {
  const source = fs.readFileSync(path.join(__dirname, '../routes/approval-management.routes.js'), 'utf8');
  assert.match(source, /authMiddleware/);
});

test('routes register feature flag middleware', () => {
  const source = fs.readFileSync(path.join(__dirname, '../routes/approval-management.routes.js'), 'utf8');
  assert.match(source, /approvalManagementFeatureFlag/);
});

test('routes define workflow endpoints', () => {
  const source = fs.readFileSync(path.join(__dirname, '../routes/approval-management.routes.js'), 'utf8');
  assert.match(source, /\/workflow/);
  assert.match(source, /\/my-approvals/);
  assert.match(source, /\/pending/);
  assert.match(source, /\/analytics/);
});

test('routes define ticket approval endpoints', () => {
  const source = fs.readFileSync(path.join(__dirname, '../routes/approval-management.routes.js'), 'utf8');
  assert.match(source, /\/ticket\/:ticketId\/start/);
  assert.match(source, /\/ticket\/:ticketId\/approve/);
  assert.match(source, /\/ticket\/:ticketId\/reject/);
});

test('routes define ticket state endpoint', () => {
  const source = fs.readFileSync(path.join(__dirname, '../routes/approval-management.routes.js'), 'utf8');
  assert.match(source, /\/ticket\/:ticketId\/state/);
});

test('controller module exports handler functions', () => {
  const source = fs.readFileSync(path.join(__dirname, '../controllers/approval-management.controller.js'), 'utf8');
  assert.match(source, /getCatalog/);
  assert.match(source, /startTicketApproval/);
  assert.match(source, /getAnalytics/);
});

test('controller delegates to service layer', () => {
  const source = fs.readFileSync(path.join(__dirname, '../controllers/approval-management.controller.js'), 'utf8');
  assert.match(source, /this\.service\./);
});
