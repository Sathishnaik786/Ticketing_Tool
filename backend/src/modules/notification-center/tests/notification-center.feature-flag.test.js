const test = require('node:test');
const assert = require('node:assert/strict');

test('feature flag returns 503 when disabled', () => {
  const prev = process.env.ENABLE_NOTIFICATION_CENTER;
  process.env.ENABLE_NOTIFICATION_CENTER = 'false';
  delete require.cache[require.resolve('../middleware/notification-center-feature-flag.middleware')];
  const mw = require('../middleware/notification-center-feature-flag.middleware');
  let status;
  const res = { status: (c) => { status = c; return res; }, json: () => {} };
  mw({}, res, () => { status = 200; });
  assert.equal(status, 503);
  process.env.ENABLE_NOTIFICATION_CENTER = prev;
});

test('feature flag calls next when enabled', () => {
  const prev = process.env.ENABLE_NOTIFICATION_CENTER;
  process.env.ENABLE_NOTIFICATION_CENTER = 'true';
  delete require.cache[require.resolve('../middleware/notification-center-feature-flag.middleware')];
  const mw = require('../middleware/notification-center-feature-flag.middleware');
  let called = false;
  mw({}, {}, () => { called = true; });
  assert.ok(called);
  process.env.ENABLE_NOTIFICATION_CENTER = prev;
});

test('feature flag rejects TRUE uppercase', () => {
  const prev = process.env.ENABLE_NOTIFICATION_CENTER;
  process.env.ENABLE_NOTIFICATION_CENTER = 'TRUE';
  delete require.cache[require.resolve('../middleware/notification-center-feature-flag.middleware')];
  const mw = require('../middleware/notification-center-feature-flag.middleware');
  let status;
  const res = { status: (c) => { status = c; return res; }, json: () => {} };
  mw({}, res, () => { status = 200; });
  assert.equal(status, 503);
  process.env.ENABLE_NOTIFICATION_CENTER = prev;
});

test('feature flag message mentions disabled', () => {
  const prev = process.env.ENABLE_NOTIFICATION_CENTER;
  process.env.ENABLE_NOTIFICATION_CENTER = 'false';
  delete require.cache[require.resolve('../middleware/notification-center-feature-flag.middleware')];
  const mw = require('../middleware/notification-center-feature-flag.middleware');
  let body;
  const res = { status: () => res, json: (b) => { body = b; } };
  mw({}, res, () => {});
  assert.match(body.message, /disabled/i);
  process.env.ENABLE_NOTIFICATION_CENTER = prev;
});

test('feature flag success false when disabled', () => {
  const prev = process.env.ENABLE_NOTIFICATION_CENTER;
  process.env.ENABLE_NOTIFICATION_CENTER = 'false';
  delete require.cache[require.resolve('../middleware/notification-center-feature-flag.middleware')];
  const mw = require('../middleware/notification-center-feature-flag.middleware');
  let body;
  const res = { status: () => res, json: (b) => { body = b; } };
  mw({}, res, () => {});
  assert.equal(body.success, false);
  process.env.ENABLE_NOTIFICATION_CENTER = prev;
});
