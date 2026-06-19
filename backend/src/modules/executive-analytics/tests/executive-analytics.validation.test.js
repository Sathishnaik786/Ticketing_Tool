const test = require('node:test');
const assert = require('node:assert/strict');
const { DashboardFilterSchema, CreateReportSchema, parseSchema } = require('../validation/executive-analytics.validation');
const AppError = require('../../../utils/app-error');

test('DashboardFilterSchema accepts empty filters', () => {
  const result = parseSchema(DashboardFilterSchema, {});
  assert.equal(result.from, undefined);
});

test('DashboardFilterSchema accepts date range', () => {
  const result = parseSchema(DashboardFilterSchema, {
    from: '2026-01-01T00:00:00.000Z',
    to: '2026-06-01T00:00:00.000Z',
  });
  assert.ok(result.from);
});

test('CreateReportSchema accepts valid report', () => {
  const result = parseSchema(CreateReportSchema, {
    name: 'Q1 Executive',
    report_type: 'EXECUTIVE',
    format: 'CSV',
  });
  assert.equal(result.format, 'CSV');
});

test('CreateReportSchema defaults format JSON', () => {
  const result = parseSchema(CreateReportSchema, { name: 'R', report_type: 'TREND' });
  assert.equal(result.format, 'JSON');
});

test('CreateReportSchema rejects empty name', () => {
  assert.throws(
    () => parseSchema(CreateReportSchema, { name: '', report_type: 'SLA' }),
    (e) => e instanceof AppError && e.statusCode === 400
  );
});

test('CreateReportSchema rejects invalid report_type', () => {
  assert.throws(
    () => parseSchema(CreateReportSchema, { name: 'X', report_type: 'INVALID' }),
    (e) => e instanceof AppError && e.statusCode === 400
  );
});

test('CreateReportSchema accepts all report types', () => {
  for (const t of ['EXECUTIVE', 'DEPARTMENT', 'BUSINESS_UNIT', 'SLA', 'CSAT', 'APPROVAL', 'KNOWLEDGE', 'TREND']) {
    const r = parseSchema(CreateReportSchema, { name: 'Test', report_type: t });
    assert.equal(r.report_type, t);
  }
});

test('CreateReportSchema accepts PDF format', () => {
  const r = parseSchema(CreateReportSchema, { name: 'P', report_type: 'CSAT', format: 'PDF' });
  assert.equal(r.format, 'PDF');
});

test('CreateReportSchema accepts filters object', () => {
  const r = parseSchema(CreateReportSchema, {
    name: 'D',
    report_type: 'DEPARTMENT',
    filters: { department_id: '550e8400-e29b-41d4-a716-446655440001' },
  });
  assert.ok(r.filters.department_id);
});

test('DashboardFilterSchema accepts department_id', () => {
  const id = '550e8400-e29b-41d4-a716-446655440001';
  const r = parseSchema(DashboardFilterSchema, { department_id: id });
  assert.equal(r.department_id, id);
});

test('DashboardFilterSchema accepts business_unit', () => {
  const r = parseSchema(DashboardFilterSchema, { business_unit: 'Aparna Realty' });
  assert.equal(r.business_unit, 'Aparna Realty');
});

test('CreateReportSchema rejects invalid format', () => {
  assert.throws(
    () => parseSchema(CreateReportSchema, { name: 'X', report_type: 'SLA', format: 'DOC' }),
    (e) => e instanceof AppError && e.statusCode === 400
  );
});
