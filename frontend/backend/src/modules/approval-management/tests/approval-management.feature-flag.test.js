const test = require('node:test');
const assert = require('node:assert/strict');
const approvalManagementFeatureFlag = require('../middleware/approval-management-feature-flag.middleware');

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

test('feature flag returns 503 when disabled', () => {
  const prev = process.env.ENABLE_APPROVAL_ENGINE;
  process.env.ENABLE_APPROVAL_ENGINE = 'false';
  const res = mockRes();
  let nextCalled = false;
  approvalManagementFeatureFlag({}, res, () => { nextCalled = true; });
  assert.equal(res.statusCode, 503);
  assert.equal(nextCalled, false);
  process.env.ENABLE_APPROVAL_ENGINE = prev;
});

test('feature flag calls next when enabled', () => {
  const prev = process.env.ENABLE_APPROVAL_ENGINE;
  process.env.ENABLE_APPROVAL_ENGINE = 'true';
  const res = mockRes();
  let nextCalled = false;
  approvalManagementFeatureFlag({}, res, () => { nextCalled = true; });
  assert.equal(nextCalled, true);
  process.env.ENABLE_APPROVAL_ENGINE = prev;
});

test('feature flag rejects TRUE uppercase', () => {
  const prev = process.env.ENABLE_APPROVAL_ENGINE;
  process.env.ENABLE_APPROVAL_ENGINE = 'TRUE';
  const res = mockRes();
  approvalManagementFeatureFlag({}, res, () => {});
  assert.equal(res.statusCode, 503);
  process.env.ENABLE_APPROVAL_ENGINE = prev;
});

test('feature flag response includes message', () => {
  const prev = process.env.ENABLE_APPROVAL_ENGINE;
  process.env.ENABLE_APPROVAL_ENGINE = 'false';
  const res = mockRes();
  approvalManagementFeatureFlag({}, res, () => {});
  assert.match(res.body.message, /disabled/i);
  process.env.ENABLE_APPROVAL_ENGINE = prev;
});

test('feature flag response success false when disabled', () => {
  const prev = process.env.ENABLE_APPROVAL_ENGINE;
  process.env.ENABLE_APPROVAL_ENGINE = 'false';
  const res = mockRes();
  approvalManagementFeatureFlag({}, res, () => {});
  assert.equal(res.body.success, false);
  process.env.ENABLE_APPROVAL_ENGINE = prev;
});
