const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('routes register auth middleware', () => {
  const source = fs.readFileSync(path.join(__dirname, '../routes/knowledge-management.routes.js'), 'utf8');
  assert.match(source, /authMiddleware/);
});

test('routes register feature flag middleware', () => {
  const source = fs.readFileSync(path.join(__dirname, '../routes/knowledge-management.routes.js'), 'utf8');
  assert.match(source, /knowledgeManagementFeatureFlag/);
});

test('routes define article endpoints', () => {
  const source = fs.readFileSync(path.join(__dirname, '../routes/knowledge-management.routes.js'), 'utf8');
  assert.match(source, /\/articles/);
  assert.match(source, /\/publish/);
  assert.match(source, /\/archive/);
  assert.match(source, /\/rate/);
  assert.match(source, /\/feedback/);
});

test('routes define search endpoint', () => {
  const source = fs.readFileSync(path.join(__dirname, '../routes/knowledge-management.routes.js'), 'utf8');
  assert.match(source, /\/search/);
});

test('routes define analytics endpoint', () => {
  const source = fs.readFileSync(path.join(__dirname, '../routes/knowledge-management.routes.js'), 'utf8');
  assert.match(source, /\/analytics/);
});

test('routes define categories endpoint', () => {
  const source = fs.readFileSync(path.join(__dirname, '../routes/knowledge-management.routes.js'), 'utf8');
  assert.match(source, /\/categories/);
});

test('controller delegates to service', () => {
  const source = fs.readFileSync(path.join(__dirname, '../controllers/knowledge-management.controller.js'), 'utf8');
  assert.match(source, /this\.service\./);
});

test('controller has all required handlers', () => {
  const source = fs.readFileSync(path.join(__dirname, '../controllers/knowledge-management.controller.js'), 'utf8');
  assert.match(source, /createArticle/);
  assert.match(source, /publishArticle/);
  assert.match(source, /searchArticles/);
  assert.match(source, /getAnalytics/);
});

test('sql migration creates knowledge tables', () => {
  const source = fs.readFileSync(
    path.join(__dirname, '../../../../database/knowledge_base_phase7_6.sql'),
    'utf8'
  );
  assert.match(source, /knowledge_categories/);
  assert.match(source, /knowledge_articles/);
  assert.match(source, /knowledge_article_versions/);
  assert.match(source, /knowledge_article_ratings/);
});

test('rollback script drops knowledge tables', () => {
  const source = fs.readFileSync(
    path.join(__dirname, '../../../../database/knowledge_base_phase7_6_rollback.sql'),
    'utf8'
  );
  assert.match(source, /DROP TABLE IF EXISTS knowledge_articles/);
});
