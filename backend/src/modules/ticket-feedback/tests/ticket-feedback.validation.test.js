const test = require('node:test');
const assert = require('node:assert/strict');
const { SubmitFeedbackSchema, MetricsQuerySchema, parseSchema } = require('../validators/ticket-feedback.validator');
const AppError = require('../../../utils/app-error');

const TICKET_ID = '550e8400-e29b-41d4-a716-446655440001';

test('SubmitFeedbackSchema accepts valid payload', () => {
  const result = parseSchema(SubmitFeedbackSchema, {
    ticket_id: TICKET_ID,
    rating: 5,
    resolution_quality: 4,
    communication_quality: 5,
    response_time: 3,
    comments: 'Good job',
  });
  assert.equal(result.rating, 5);
});

test('SubmitFeedbackSchema rejects missing ticket_id', () => {
  assert.throws(
    () => parseSchema(SubmitFeedbackSchema, { rating: 5, resolution_quality: 4, communication_quality: 5, response_time: 3 }),
    (err) => err instanceof AppError && err.statusCode === 400
  );
});

test('SubmitFeedbackSchema rejects resolution_quality out of range', () => {
  assert.throws(
    () => parseSchema(SubmitFeedbackSchema, {
      ticket_id: TICKET_ID,
      rating: 5,
      resolution_quality: 6,
      communication_quality: 5,
      response_time: 3,
    }),
    (err) => err instanceof AppError && err.statusCode === 400
  );
});

test('SubmitFeedbackSchema rejects communication_quality below range', () => {
  assert.throws(
    () => parseSchema(SubmitFeedbackSchema, {
      ticket_id: TICKET_ID,
      rating: 5,
      resolution_quality: 4,
      communication_quality: 0,
      response_time: 3,
    }),
    (err) => err instanceof AppError && err.statusCode === 400
  );
});

test('SubmitFeedbackSchema rejects response_time out of range', () => {
  assert.throws(
    () => parseSchema(SubmitFeedbackSchema, {
      ticket_id: TICKET_ID,
      rating: 5,
      resolution_quality: 4,
      communication_quality: 5,
      response_time: 10,
    }),
    (err) => err instanceof AppError && err.statusCode === 400
  );
});

test('SubmitFeedbackSchema allows null comments', () => {
  const result = parseSchema(SubmitFeedbackSchema, {
    ticket_id: TICKET_ID,
    rating: 3,
    resolution_quality: 3,
    communication_quality: 3,
    response_time: 3,
    comments: null,
  });
  assert.equal(result.comments, null);
});

test('MetricsQuerySchema accepts empty query', () => {
  const result = parseSchema(MetricsQuerySchema, {});
  assert.deepEqual(result, {});
});

test('MetricsQuerySchema accepts optional department_id', () => {
  const deptId = '550e8400-e29b-41d4-a716-446655440020';
  const result = parseSchema(MetricsQuerySchema, { department_id: deptId });
  assert.equal(result.department_id, deptId);
});

test('MetricsQuerySchema rejects invalid department_id', () => {
  assert.throws(
    () => parseSchema(MetricsQuerySchema, { department_id: 'bad' }),
    (err) => err instanceof AppError && err.statusCode === 400
  );
});
