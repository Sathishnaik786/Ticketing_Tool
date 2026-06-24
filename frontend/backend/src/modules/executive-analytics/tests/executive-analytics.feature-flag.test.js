const test = require('node:test');
const assert = require('node:assert/strict');
const executiveAnalyticsFeatureFlag = require('../middleware/executive-analytics-feature-flag.middleware');

function mockRes() {
  const res = { statusCode: 200, body: null };
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (b) => { res.body = b; return res; };
  return res;
}

test('feature flag returns 503 when disabled', () => {
  const prev = process.env.ENABLE_EXECUTIVE_ANALYTICS;
  process.env.ENABLE_EXECUTIVE_ANALYTICS = 'false';
  const res = mockRes();
  let next = false;
  executiveAnalyticsFeatureFlag({}, res, () => { next = true; });
  assert.equal(res.statusCode, 503);
  assert.equal(next, false);
  process.env.ENABLE_EXECUTIVE_ANALYTICS = prev;
});

test('feature flag calls next when enabled', () => {
  const prev = process.env.ENABLE_EXECUTIVE_ANALYTICS;
  process.env.ENABLE_EXECUTIVE_ANALYTICS = 'true';
  let next = false;
  executiveAnalyticsFeatureFlag({}, mockRes(), () => { next = true; });
  assert.equal(next, true);
  process.env.ENABLE_EXECUTIVE_ANALYTICS = prev;
});

test('feature flag rejects TRUE uppercase', () => {
  const prev = process.env.ENABLE_EXECUTIVE_ANALYTICS;
  process.env.ENABLE_EXECUTIVE_ANALYTICS = 'TRUE';
  const res = mockRes();
  executiveAnalyticsFeatureFlag({}, res, () => {});
  assert.equal(res.statusCode, 503);
  process.env.ENABLE_EXECUTIVE_ANALYTICS = prev;
});

test('feature flag message mentions disabled', () => {
  const prev = process.env.ENABLE_EXECUTIVE_ANALYTICS;
  process.env.ENABLE_EXECUTIVE_ANALYTICS = 'false';
  const res = mockRes();
  executiveAnalyticsFeatureFlag({}, res, () => {});
  assert.match(res.body.message, /disabled/i);
  process.env.ENABLE_EXECUTIVE_ANALYTICS = prev;
});

test('feature flag success false when disabled', () => {
  const prev = process.env.ENABLE_EXECUTIVE_ANALYTICS;
  process.env.ENABLE_EXECUTIVE_ANALYTICS = 'false';
  const res = mockRes();
  executiveAnalyticsFeatureFlag({}, res, () => {});
  assert.equal(res.body.success, false);
  process.env.ENABLE_EXECUTIVE_ANALYTICS = prev;
});
