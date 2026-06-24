const test = require('node:test');
const assert = require('node:assert/strict');
const {
  CreateArticleSchema,
  UpdateArticleSchema,
  RateArticleSchema,
  ArticleFeedbackSchema,
  SearchSchema,
  parseSchema,
} = require('../validation/knowledge-management.validation');
const AppError = require('../../../utils/app-error');

const CAT_ID = '550e8400-e29b-41d4-a716-446655440001';
const ART_ID = '550e8400-e29b-41d4-a716-446655440002';

test('CreateArticleSchema accepts valid payload', () => {
  const result = parseSchema(CreateArticleSchema, {
    category_id: CAT_ID,
    title: 'VPN Guide',
    content: 'Content here',
    tags: ['vpn', 'faq'],
  });
  assert.equal(result.status, 'DRAFT');
});

test('CreateArticleSchema defaults tags to empty array', () => {
  const result = parseSchema(CreateArticleSchema, {
    category_id: CAT_ID,
    title: 'Test',
    content: 'Body',
  });
  assert.deepEqual(result.tags, []);
});

test('CreateArticleSchema rejects empty title', () => {
  assert.throws(
    () => parseSchema(CreateArticleSchema, { category_id: CAT_ID, title: '', content: 'x' }),
    (err) => err instanceof AppError && err.statusCode === 400
  );
});

test('CreateArticleSchema rejects empty content', () => {
  assert.throws(
    () => parseSchema(CreateArticleSchema, { category_id: CAT_ID, title: 'T', content: '' }),
    (err) => err instanceof AppError && err.statusCode === 400
  );
});

test('CreateArticleSchema accepts REVIEW status', () => {
  const result = parseSchema(CreateArticleSchema, {
    category_id: CAT_ID,
    title: 'T',
    content: 'C',
    status: 'REVIEW',
  });
  assert.equal(result.status, 'REVIEW');
});

test('CreateArticleSchema rejects invalid category_id', () => {
  assert.throws(
    () => parseSchema(CreateArticleSchema, { category_id: 'bad', title: 'T', content: 'C' }),
    (err) => err instanceof AppError && err.statusCode === 400
  );
});

test('UpdateArticleSchema allows partial update', () => {
  const result = parseSchema(UpdateArticleSchema, { title: 'Updated' });
  assert.equal(result.title, 'Updated');
});

test('UpdateArticleSchema accepts ARCHIVED status', () => {
  const result = parseSchema(UpdateArticleSchema, { status: 'ARCHIVED' });
  assert.equal(result.status, 'ARCHIVED');
});

test('RateArticleSchema accepts valid rating', () => {
  const result = parseSchema(RateArticleSchema, { rating: 5 });
  assert.equal(result.rating, 5);
});

test('RateArticleSchema rejects rating below 1', () => {
  assert.throws(
    () => parseSchema(RateArticleSchema, { rating: 0 }),
    (err) => err instanceof AppError && err.statusCode === 400
  );
});

test('RateArticleSchema rejects rating above 5', () => {
  assert.throws(
    () => parseSchema(RateArticleSchema, { rating: 6 }),
    (err) => err instanceof AppError && err.statusCode === 400
  );
});

test('ArticleFeedbackSchema accepts helpful feedback', () => {
  const result = parseSchema(ArticleFeedbackSchema, {
    feedback_type: 'HELPFUL',
    message: 'Very useful',
  });
  assert.equal(result.feedback_type, 'HELPFUL');
});

test('ArticleFeedbackSchema defaults feedback_type', () => {
  const result = parseSchema(ArticleFeedbackSchema, { message: 'Good' });
  assert.equal(result.feedback_type, 'GENERAL');
});

test('ArticleFeedbackSchema rejects empty message', () => {
  assert.throws(
    () => parseSchema(ArticleFeedbackSchema, { message: '' }),
    (err) => err instanceof AppError && err.statusCode === 400
  );
});

test('SearchSchema accepts valid query', () => {
  const result = parseSchema(SearchSchema, { q: 'password reset' });
  assert.equal(result.q, 'password reset');
  assert.equal(result.limit, 10);
});

test('SearchSchema accepts custom limit', () => {
  const result = parseSchema(SearchSchema, { q: 'vpn', limit: 20 });
  assert.equal(result.limit, 20);
});

test('SearchSchema rejects empty query', () => {
  assert.throws(
    () => parseSchema(SearchSchema, { q: '' }),
    (err) => err instanceof AppError && err.statusCode === 400
  );
});

test('SearchSchema accepts category_id filter', () => {
  const result = parseSchema(SearchSchema, { q: 'leave', category_id: CAT_ID });
  assert.equal(result.category_id, CAT_ID);
});

test('CreateArticleSchema accepts summary', () => {
  const result = parseSchema(CreateArticleSchema, {
    category_id: CAT_ID,
    title: 'T',
    summary: 'Short summary',
    content: 'C',
  });
  assert.equal(result.summary, 'Short summary');
});

test('UpdateArticleSchema accepts tags array', () => {
  const result = parseSchema(UpdateArticleSchema, { tags: ['hr', 'leave'] });
  assert.deepEqual(result.tags, ['hr', 'leave']);
});

test('ArticleFeedbackSchema accepts SUGGESTION type', () => {
  const result = parseSchema(ArticleFeedbackSchema, {
    feedback_type: 'SUGGESTION',
    message: 'Add screenshots',
  });
  assert.equal(result.feedback_type, 'SUGGESTION');
});

test('SearchSchema rejects limit above 50', () => {
  assert.throws(
    () => parseSchema(SearchSchema, { q: 'test', limit: 100 }),
    (err) => err instanceof AppError && err.statusCode === 400
  );
});
