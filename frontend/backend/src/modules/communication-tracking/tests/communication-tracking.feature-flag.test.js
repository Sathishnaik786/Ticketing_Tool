const test = require('node:test');
const assert = require('node:assert/strict');
const communicationTrackingFeatureFlag = require('../middleware/communication-tracking-feature-flag.middleware');

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
  const prev = process.env.ENABLE_COMMUNICATION_TRACKING;
  process.env.ENABLE_COMMUNICATION_TRACKING = 'false';
  const res = mockRes();
  let nextCalled = false;
  communicationTrackingFeatureFlag({}, res, () => { nextCalled = true; });
  assert.equal(res.statusCode, 503);
  assert.equal(nextCalled, false);
  process.env.ENABLE_COMMUNICATION_TRACKING = prev;
});

test('feature flag calls next when enabled', () => {
  const prev = process.env.ENABLE_COMMUNICATION_TRACKING;
  process.env.ENABLE_COMMUNICATION_TRACKING = 'true';
  const res = mockRes();
  let nextCalled = false;
  communicationTrackingFeatureFlag({}, res, () => { nextCalled = true; });
  assert.equal(nextCalled, true);
  process.env.ENABLE_COMMUNICATION_TRACKING = prev;
});

test('feature flag rejects TRUE uppercase', () => {
  const prev = process.env.ENABLE_COMMUNICATION_TRACKING;
  process.env.ENABLE_COMMUNICATION_TRACKING = 'TRUE';
  const res = mockRes();
  communicationTrackingFeatureFlag({}, res, () => {});
  assert.equal(res.statusCode, 503);
  process.env.ENABLE_COMMUNICATION_TRACKING = prev;
});

test('feature flag response includes message', () => {
  const prev = process.env.ENABLE_COMMUNICATION_TRACKING;
  process.env.ENABLE_COMMUNICATION_TRACKING = 'false';
  const res = mockRes();
  communicationTrackingFeatureFlag({}, res, () => {});
  assert.match(res.body.message, /disabled/i);
  process.env.ENABLE_COMMUNICATION_TRACKING = prev;
});

test('feature flag response success false when disabled', () => {
  const prev = process.env.ENABLE_COMMUNICATION_TRACKING;
  process.env.ENABLE_COMMUNICATION_TRACKING = 'false';
  const res = mockRes();
  communicationTrackingFeatureFlag({}, res, () => {});
  assert.equal(res.body.success, false);
  process.env.ENABLE_COMMUNICATION_TRACKING = prev;
});
