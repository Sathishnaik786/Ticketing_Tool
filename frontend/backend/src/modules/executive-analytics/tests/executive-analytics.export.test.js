const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { buildExportBuffer, rowsToCsv, payloadToRows } = require('../utils/executive-analytics.export');

test('rowsToCsv generates header row', () => {
  const csv = rowsToCsv([{ a: 1, b: 2 }]);
  assert.match(csv, /^a,b/);
  assert.match(csv, /1,2/);
});

test('rowsToCsv quotes string values', () => {
  const csv = rowsToCsv([{ note: 'hello, world' }]);
  assert.match(csv, /"hello, world"/);
});

test('rowsToCsv empty returns empty string', () => {
  assert.equal(rowsToCsv([]), '');
});

test('payloadToRows from kpis object', () => {
  const rows = payloadToRows({ kpis: { open: 5, closed: 3 } });
  assert.equal(rows.length, 2);
});

test('payloadToRows from array', () => {
  const rows = payloadToRows([{ x: 1 }]);
  assert.equal(rows[0].x, 1);
});

test('buildExportBuffer CSV format', async () => {
  const r = await buildExportBuffer('CSV', { kpis: { total: 10 } }, 'Test');
  assert.equal(r.extension, 'csv');
  assert.equal(r.contentType, 'text/csv');
});

test('buildExportBuffer XLSX format', async () => {
  const r = await buildExportBuffer('XLSX', [{ metric: 'a', value: 1 }], 'Test');
  assert.equal(r.extension, 'xlsx');
  assert.ok(r.buffer.length > 0);
});

test('buildExportBuffer PDF format', async () => {
  const r = await buildExportBuffer('PDF', { data: true }, 'Report');
  assert.equal(r.extension, 'pdf');
});

test('buildExportBuffer JSON default', async () => {
  const r = await buildExportBuffer('JSON', { ok: true }, 'Report');
  assert.equal(r.extension, 'json');
});

test('routes define executive-dashboard', () => {
  const src = fs.readFileSync(path.join(__dirname, '../routes/executive-analytics.routes.js'), 'utf8');
  assert.match(src, /executive-dashboard/);
});

test('routes define all endpoints', () => {
  const src = fs.readFileSync(path.join(__dirname, '../routes/executive-analytics.routes.js'), 'utf8');
  assert.match(src, /department-dashboard/);
  assert.match(src, /business-unit-dashboard/);
  assert.match(src, /\/reports/);
});

test('sql migration creates saved filters table', () => {
  const src = fs.readFileSync(path.join(__dirname, '../../../../database/executive_analytics_phase7_7.sql'), 'utf8');
  assert.match(src, /analytics_saved_filters/);
  assert.match(src, /analytics_dashboard_configs/);
});

test('repository module is read-only for ETMS tables', () => {
  const src = fs.readFileSync(path.join(__dirname, '../repositories/executive-analytics.repository.js'), 'utf8');
  assert.match(src, /fetchTickets/);
  assert.doesNotMatch(src, /\.insert\(\s*['"]tickets['"]/);
});

test('rollback drops analytics tables', () => {
  const src = fs.readFileSync(path.join(__dirname, '../../../../database/executive_analytics_phase7_7_rollback.sql'), 'utf8');
  assert.match(src, /DROP TABLE IF EXISTS analytics_reports/);
});

test('controller delegates to service layer', () => {
  const src = fs.readFileSync(path.join(__dirname, '../controllers/executive-analytics.controller.js'), 'utf8');
  assert.match(src, /getExecutiveDashboard/);
  assert.match(src, /createReport/);
});
