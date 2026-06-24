const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('routes define my-notifications', () => {
  const src = fs.readFileSync(path.join(__dirname, '../routes/notification-center.routes.js'), 'utf8');
  assert.match(src, /my-notifications/);
});

test('routes define unread-count', () => {
  const src = fs.readFileSync(path.join(__dirname, '../routes/notification-center.routes.js'), 'utf8');
  assert.match(src, /unread-count/);
});

test('routes define mark-all-read', () => {
  const src = fs.readFileSync(path.join(__dirname, '../routes/notification-center.routes.js'), 'utf8');
  assert.match(src, /mark-all-read/);
});

test('routes define templates delete', () => {
  const src = fs.readFileSync(path.join(__dirname, '../routes/notification-center.routes.js'), 'utf8');
  assert.match(src, /router\.delete\('\/templates\/:id'/);
});

test('sql creates notification_center_events', () => {
  const src = fs.readFileSync(path.join(__dirname, '../../../../database/notification_center_phase7_8.sql'), 'utf8');
  assert.match(src, /notification_center_events/);
  assert.match(src, /notification_delivery_log/);
});

test('rollback drops tables', () => {
  const src = fs.readFileSync(path.join(__dirname, '../../../../database/notification_center_phase7_8_rollback.sql'), 'utf8');
  assert.match(src, /DROP TABLE IF EXISTS notification_center_events/);
});

test('repository does not write to notifications table', () => {
  const src = fs.readFileSync(path.join(__dirname, '../repositories/notification-center.repository.js'), 'utf8');
  assert.doesNotMatch(src, /\.from\(['"]notifications['"]\)/);
});

test('controller delegates to service', () => {
  const src = fs.readFileSync(path.join(__dirname, '../controllers/notification-center.controller.js'), 'utf8');
  assert.match(src, /getMyNotifications/);
  assert.match(src, /getAnalytics/);
});

test('sql seeds templates', () => {
  const src = fs.readFileSync(path.join(__dirname, '../../../../database/notification_center_phase7_8.sql'), 'utf8');
  assert.match(src, /INSERT INTO notification_templates/);
});

test('event types unique constraint', () => {
  const src = fs.readFileSync(path.join(__dirname, '../../../../database/notification_center_phase7_8.sql'), 'utf8');
  assert.match(src, /UNIQUE \(employee_id, event_type, source_module, source_id\)/);
});
