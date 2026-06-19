const test = require('node:test');
const assert = require('node:assert/strict');
const KnowledgeManagementService = require('../services/knowledge-management.service');
const AppError = require('../../../utils/app-error');
const {
  ARTICLE_ADMIN_ROLES,
  ARTICLE_PUBLISH_ROLES,
  ANALYTICS_ROLES,
} = require('../knowledge-management.constants');

test('ARTICLE_ADMIN_ROLES excludes EMPLOYEE', () => {
  assert.equal(ARTICLE_ADMIN_ROLES.includes('EMPLOYEE'), false);
});

test('ARTICLE_PUBLISH_ROLES includes MANAGER', () => {
  assert.ok(ARTICLE_PUBLISH_ROLES.includes('MANAGER'));
});

test('ANALYTICS_ROLES includes HR', () => {
  assert.ok(ANALYTICS_ROLES.includes('HR'));
});

test('employee cannot access analytics', async () => {
  const service = new KnowledgeManagementService({ repository: {} });
  await assert.rejects(
    () => service.getAnalytics({ role: 'EMPLOYEE', employeeId: 'e1' }),
    (err) => err instanceof AppError && err.statusCode === 403
  );
});

test('employee cannot publish', async () => {
  const service = new KnowledgeManagementService({ repository: {} });
  await assert.rejects(
    () => service.publishArticle({ role: 'EMPLOYEE', employeeId: 'e1' }, 'a1'),
    (err) => err instanceof AppError && err.statusCode === 403
  );
});

test('manager can publish', async () => {
  const service = new KnowledgeManagementService({
    repository: {
      getArticleById: async () => ({ id: 'a1', status: 'REVIEW' }),
      updateArticle: async () => ({ id: 'a1', status: 'PUBLISHED' }),
    },
  });
  const result = await service.publishArticle({ role: 'MANAGER', employeeId: 'm1' }, 'a1');
  assert.equal(result.data.status, 'PUBLISHED');
});

test('admin has category management access via assertAdmin', () => {
  const service = new KnowledgeManagementService({ repository: {} });
  assert.doesNotThrow(() => service.assertAdmin({ role: 'ADMIN' }));
});

test('employee lacks admin access', () => {
  const service = new KnowledgeManagementService({ repository: {} });
  assert.throws(
    () => service.assertAdmin({ role: 'EMPLOYEE' }),
    (err) => err instanceof AppError && err.statusCode === 403
  );
});

test('employee can create articles', () => {
  const service = new KnowledgeManagementService({ repository: {} });
  assert.doesNotThrow(() => service.assertAuthor({ role: 'EMPLOYEE' }));
});

test('finance cannot access analytics', async () => {
  const service = new KnowledgeManagementService({ repository: {} });
  await assert.rejects(
    () => service.getAnalytics({ role: 'FINANCE', employeeId: 'f1' }),
    (err) => err instanceof AppError && err.statusCode === 403
  );
});

test('super admin has full admin access', () => {
  assert.ok(ARTICLE_ADMIN_ROLES.includes('SUPER_ADMIN'));
});

test('manager has analytics access', async () => {
  const service = new KnowledgeManagementService({
    repository: {
      listArticles: async () => [],
      listAllViews: async () => [],
      listAllRatings: async () => [],
      listAllFeedback: async () => [],
    },
  });
  const result = await service.getAnalytics({ role: 'MANAGER', employeeId: 'm1' });
  assert.equal(result.success, true);
});
