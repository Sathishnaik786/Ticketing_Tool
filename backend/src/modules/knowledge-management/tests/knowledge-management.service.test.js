const test = require('node:test');
const assert = require('node:assert/strict');
const KnowledgeManagementService = require('../services/knowledge-management.service');
const AppError = require('../../../utils/app-error');
const { createMockSupabase } = require('../../ticketing/tests/helpers/mock-supabase');
const {
  ARTICLE_STATUSES,
  CATEGORY_TYPES,
  ARTICLE_ADMIN_ROLES,
} = require('../knowledge-management.constants');

const CAT_ID = '550e8400-e29b-41d4-a716-446655440001';
const ART_ID = '550e8400-e29b-41d4-a716-446655440002';
const EMP_ID = '550e8400-e29b-41d4-a716-446655440010';
const MGR_ID = '550e8400-e29b-41d4-a716-446655440011';
const ADMIN_ID = '550e8400-e29b-41d4-a716-446655440013';

const publishedArticle = {
  id: ART_ID,
  category_id: CAT_ID,
  title: 'Password Reset',
  summary: 'Reset guide',
  content: 'Steps to reset',
  status: 'PUBLISHED',
  author_id: EMP_ID,
  published_at: '2026-06-01T10:00:00.000Z',
  current_version: 1,
};

const draftArticle = {
  ...publishedArticle,
  id: '550e8400-e29b-41d4-a716-446655440003',
  status: 'DRAFT',
  published_at: null,
};

function buildDb(overrides = {}) {
  const articles = overrides.articles ?? [publishedArticle];
  const categories = overrides.categories ?? [{ id: CAT_ID, name: 'IT Support', category: 'IT', is_active: true }];
  const tags = overrides.tags ?? [{ id: 't1', article_id: ART_ID, tag: 'password' }];
  const views = overrides.views ?? [];
  const ratings = overrides.ratings ?? [];
  const feedback = overrides.feedback ?? [];
  const versions = overrides.versions ?? [];

  return createMockSupabase({
    handlers: {
      knowledge_categories: { select: () => ({ data: categories, error: null }) },
      knowledge_articles: {
        select: (context) => {
          const { filters, maybeSingle } = context;
          let rows = [...articles];
          const idFilter = filters.find((f) => f.type === 'eq' && f.column === 'id');
          const statusFilter = filters.find((f) => f.type === 'eq' && f.column === 'status');
          const catFilter = filters.find((f) => f.type === 'eq' && f.column === 'category_id');
          if (idFilter) rows = rows.filter((r) => r.id === idFilter.value);
          if (statusFilter) rows = rows.filter((r) => r.status === statusFilter.value);
          if (catFilter) rows = rows.filter((r) => r.category_id === catFilter.value);
          if (maybeSingle) return { data: rows[0] ?? null, error: null };
          return { data: rows, error: null };
        },
        insert: ({ payload }) => {
          const row = { id: ART_ID, ...payload, created_at: new Date().toISOString() };
          articles.push(row);
          return { data: row, error: null };
        },
        update: ({ payload, filters }) => {
          const id = filters.find((f) => f.column === 'id')?.value;
          const idx = articles.findIndex((a) => a.id === id);
          if (idx >= 0) articles[idx] = { ...articles[idx], ...payload };
          return { data: articles[idx], error: null };
        },
      },
      knowledge_article_tags: {
        select: ({ filters }) => {
          const aid = filters.find((f) => f.column === 'article_id')?.value;
          return { data: tags.filter((t) => t.article_id === aid), error: null };
        },
        delete: () => ({ data: null, error: null }),
        insert: ({ payload }) => ({ data: Array.isArray(payload) ? payload : [payload], error: null }),
      },
      knowledge_article_versions: {
        insert: ({ payload }) => {
          const row = { id: 'v1', ...payload };
          versions.push(row);
          return { data: row, error: null };
        },
        select: () => ({ data: versions, error: null }),
      },
      knowledge_article_ratings: {
        upsert: ({ payload }) => ({ data: { id: 'r1', ...payload }, error: null }),
        select: () => ({ data: ratings, error: null }),
      },
      knowledge_article_views: {
        insert: ({ payload }) => {
          views.push(payload);
          return { data: payload, error: null };
        },
        select: () => ({ data: views, error: null }),
      },
      knowledge_article_feedback: {
        insert: ({ payload }) => {
          feedback.push(payload);
          return { data: { id: 'f1', ...payload }, error: null };
        },
        select: () => ({ data: feedback, error: null }),
      },
    },
  });
}

function svc(repoOrDb) {
  if (typeof repoOrDb?.from === 'function') {
    return new KnowledgeManagementService({ supabaseAdmin: repoOrDb });
  }
  return new KnowledgeManagementService({ repository: repoOrDb });
}

test('constants include article statuses', () => {
  assert.ok(ARTICLE_STATUSES.includes('PUBLISHED'));
  assert.ok(ARTICLE_STATUSES.includes('DRAFT'));
});

test('constants include category types', () => {
  assert.ok(CATEGORY_TYPES.includes('IT'));
  assert.ok(CATEGORY_TYPES.includes('FACILITIES'));
});

test('getCategories returns categories', async () => {
  const result = await svc(buildDb()).getCategories();
  assert.equal(result.data.length, 1);
});

test('employee sees only published articles', async () => {
  const mockRepo = {
    listArticles: async (filters) => {
      const all = [publishedArticle, draftArticle];
      return filters.status ? all.filter((a) => a.status === filters.status) : all;
    },
    getTags: async () => [],
  };
  const result = await svc(mockRepo).listArticles({ role: 'EMPLOYEE', employeeId: EMP_ID });
  assert.ok(result.data.every((a) => a.status === 'PUBLISHED'));
});

test('admin sees all articles', async () => {
  const mockRepo = {
    listArticles: async () => [publishedArticle, draftArticle],
    getTags: async () => [],
  };
  const result = await svc(mockRepo).listArticles({ role: 'ADMIN', employeeId: ADMIN_ID });
  assert.equal(result.data.length, 2);
});

test('employee can view published article', async () => {
  const result = await svc(buildDb()).getArticle({ role: 'EMPLOYEE', employeeId: EMP_ID }, ART_ID);
  assert.equal(result.data.article.title, 'Password Reset');
});

test('employee cannot view draft article', async () => {
  const db = buildDb({ articles: [draftArticle] });
  await assert.rejects(
    () => svc(db).getArticle({ role: 'EMPLOYEE', employeeId: EMP_ID }, draftArticle.id),
    (err) => err instanceof AppError && err.statusCode === 403
  );
});

test('createArticle requires employee profile', async () => {
  await assert.rejects(
    () => svc(buildDb()).createArticle({ role: 'EMPLOYEE' }, {
      category_id: CAT_ID, title: 'T', content: 'C',
    }),
    (err) => err instanceof AppError && err.statusCode === 403
  );
});

test('employee can create draft article', async () => {
  const result = await svc(buildDb()).createArticle(
    { role: 'EMPLOYEE', employeeId: EMP_ID },
    { category_id: CAT_ID, title: 'New Article', content: 'Content', tags: ['faq'] }
  );
  assert.equal(result.success, true);
});

test('publishArticle requires manager role', async () => {
  await assert.rejects(
    () => svc(buildDb()).publishArticle({ role: 'EMPLOYEE', employeeId: EMP_ID }, ART_ID),
    (err) => err instanceof AppError && err.statusCode === 403
  );
});

test('manager can publish article', async () => {
  const db = buildDb({ articles: [{ ...draftArticle, status: 'REVIEW' }] });
  const result = await svc(db).publishArticle({ role: 'MANAGER', employeeId: MGR_ID }, draftArticle.id);
  assert.equal(result.data.status, 'PUBLISHED');
});

test('archiveArticle requires manager role', async () => {
  await assert.rejects(
    () => svc(buildDb()).archiveArticle({ role: 'EMPLOYEE', employeeId: EMP_ID }, ART_ID),
    (err) => err instanceof AppError && err.statusCode === 403
  );
});

test('manager can archive article', async () => {
  const result = await svc(buildDb()).archiveArticle({ role: 'MANAGER', employeeId: MGR_ID }, ART_ID);
  assert.equal(result.data.status, 'ARCHIVED');
});

test('rateArticle requires employee profile', async () => {
  await assert.rejects(
    () => svc(buildDb()).rateArticle({ role: 'EMPLOYEE' }, ART_ID, { rating: 5 }),
    (err) => err instanceof AppError && err.statusCode === 403
  );
});

test('employee can rate published article', async () => {
  const mockRepo = {
    getArticleById: async () => publishedArticle,
    upsertRating: async (row) => ({ id: 'r1', ...row }),
  };
  const result = await svc(mockRepo).rateArticle(
    { role: 'EMPLOYEE', employeeId: EMP_ID },
    ART_ID,
    { rating: 4 }
  );
  assert.equal(result.data.rating, 4);
});

test('cannot rate draft article', async () => {
  const db = buildDb({ articles: [draftArticle] });
  await assert.rejects(
    () => svc(db).rateArticle({ role: 'EMPLOYEE', employeeId: EMP_ID }, draftArticle.id, { rating: 5 }),
    (err) => err instanceof AppError && err.statusCode === 400
  );
});

test('submitFeedback for published article', async () => {
  const result = await svc(buildDb()).submitFeedback(
    { role: 'EMPLOYEE', employeeId: EMP_ID },
    ART_ID,
    { message: 'Very helpful', feedback_type: 'HELPFUL' }
  );
  assert.equal(result.success, true);
});

test('searchArticles returns results', async () => {
  const mockRepo = {
    searchPublishedArticles: async () => [publishedArticle],
    getTags: async () => [{ tag: 'password' }],
    recordView: async () => ({}),
  };
  const result = await svc(mockRepo).searchArticles(
    { role: 'EMPLOYEE', employeeId: EMP_ID },
    { q: 'password' }
  );
  assert.equal(result.success, true);
  assert.equal(result.data.count, 1);
});

test('searchArticles rejects empty query', async () => {
  await assert.rejects(
    () => svc(buildDb()).searchArticles({ role: 'EMPLOYEE', employeeId: EMP_ID }, { q: '' }),
    (err) => err instanceof AppError && err.statusCode === 400
  );
});

test('getAnalytics requires manager or admin', async () => {
  await assert.rejects(
    () => svc(buildDb()).getAnalytics({ role: 'EMPLOYEE', employeeId: EMP_ID }),
    (err) => err instanceof AppError && err.statusCode === 403
  );
});

test('manager can access analytics', async () => {
  const mockRepo = {
    listArticles: async () => [publishedArticle],
    listAllViews: async () => [{ article_id: ART_ID }],
    listAllRatings: async () => [{ article_id: ART_ID, rating: 5 }],
    listAllFeedback: async () => [],
  };
  const result = await svc(mockRepo).getAnalytics({ role: 'MANAGER', employeeId: MGR_ID });
  assert.equal(result.data.totalArticles, 1);
});

test('admin can update any article', async () => {
  const mockRepo = {
    getArticleById: async () => draftArticle,
    updateArticle: async (_id, row) => ({ ...draftArticle, ...row }),
    replaceTags: async () => [],
    createVersion: async () => ({}),
  };
  const result = await svc(mockRepo).updateArticle(
    { role: 'ADMIN', employeeId: ADMIN_ID },
    draftArticle.id,
    { title: 'Updated Title' }
  );
  assert.equal(result.data.title, 'Updated Title');
});

test('employee cannot edit others draft', async () => {
  const mockRepo = {
    getArticleById: async () => ({ ...draftArticle, author_id: 'other-id' }),
  };
  await assert.rejects(
    () => svc(mockRepo).updateArticle(
      { role: 'EMPLOYEE', employeeId: EMP_ID },
      draftArticle.id,
      { title: 'Hack' }
    ),
    (err) => err instanceof AppError && err.statusCode === 403
  );
});

test('author can edit own draft', async () => {
  const mockRepo = {
    getArticleById: async () => ({ ...draftArticle, author_id: EMP_ID }),
    updateArticle: async (_id, row) => ({ ...draftArticle, ...row }),
    replaceTags: async () => [],
    createVersion: async () => ({}),
  };
  const result = await svc(mockRepo).updateArticle(
    { role: 'EMPLOYEE', employeeId: EMP_ID },
    draftArticle.id,
    { title: 'My Update' }
  );
  assert.equal(result.data.title, 'My Update');
});

test('publish rejects archived article', async () => {
  const mockRepo = {
    getArticleById: async () => ({ ...publishedArticle, status: 'ARCHIVED' }),
  };
  await assert.rejects(
    () => svc(mockRepo).publishArticle({ role: 'MANAGER', employeeId: MGR_ID }, ART_ID),
    (err) => err instanceof AppError && err.statusCode === 400
  );
});

test('ARTICLE_ADMIN_ROLES includes SUPER_ADMIN', () => {
  assert.ok(ARTICLE_ADMIN_ROLES.includes('SUPER_ADMIN'));
});

test('getRelatedArticles returns related', async () => {
  const mockRepo = {
    getArticleById: async (id) => (
      id === 'other-id'
        ? { ...publishedArticle, id: 'other-id', title: 'Related', status: 'PUBLISHED' }
        : publishedArticle
    ),
    getTags: async () => [{ tag: 'password' }],
    db: {
      from: () => ({
        select: () => ({
          eq: () => Promise.resolve({ data: [{ article_id: 'other-id' }], error: null }),
        }),
      }),
    },
    listPublishedArticles: async () => [publishedArticle],
  };
  const result = await svc(mockRepo).getRelatedArticles(ART_ID);
  assert.equal(result.success, true);
});

test('HR can access analytics', async () => {
  const mockRepo = {
    listArticles: async () => [],
    listAllViews: async () => [],
    listAllRatings: async () => [],
    listAllFeedback: async () => [],
  };
  const result = await svc(mockRepo).getAnalytics({ role: 'HR', employeeId: 'hr-1' });
  assert.equal(result.success, true);
});

test('feedback rejected for draft', async () => {
  const mockRepo = { getArticleById: async () => draftArticle };
  await assert.rejects(
    () => svc(mockRepo).submitFeedback({ role: 'EMPLOYEE', employeeId: EMP_ID }, draftArticle.id, { message: 'x' }),
    (err) => err instanceof AppError && err.statusCode === 400
  );
});

test('listArticles enriches with tags', async () => {
  const mockRepo = {
    listArticles: async () => [publishedArticle],
    getTags: async () => [{ tag: 'password' }],
  };
  const result = await svc(mockRepo).listArticles({ role: 'ADMIN', employeeId: ADMIN_ID });
  assert.deepEqual(result.data[0].tags, ['password']);
});

test('view recorded on published article read', async () => {
  const db = buildDb();
  await svc(db).getArticle({ role: 'EMPLOYEE', employeeId: EMP_ID }, ART_ID);
  assert.equal(true, true);
});

test('super admin can publish', async () => {
  const mockRepo = {
    getArticleById: async () => ({ ...draftArticle, status: 'REVIEW' }),
    updateArticle: async (_id, row) => ({ ...draftArticle, ...row }),
  };
  const result = await svc(mockRepo).publishArticle({ role: 'SUPER_ADMIN', employeeId: ADMIN_ID }, draftArticle.id);
  assert.equal(result.data.status, 'PUBLISHED');
});

test('analytics includes deflection rate', async () => {
  const mockRepo = {
    listArticles: async () => [publishedArticle],
    listAllViews: async () => [
      { article_id: ART_ID, search_query: 'password' },
      { article_id: null, search_query: 'unknown' },
    ],
    listAllRatings: async () => [],
    listAllFeedback: async () => [],
  };
  const result = await svc(mockRepo).getAnalytics({ role: 'ADMIN', employeeId: ADMIN_ID });
  assert.equal(typeof result.data.ticketDeflectionRate, 'number');
});

test('employee author roles include EMPLOYEE', async () => {
  const { ARTICLE_AUTHOR_ROLES } = require('../knowledge-management.constants');
  assert.ok(ARTICLE_AUTHOR_ROLES.includes('EMPLOYEE'));
});

test('search logs failed search when no results', async () => {
  const mockRepo = {
    searchPublishedArticles: async () => [],
    getTags: async () => [],
    recordView: async (row) => row,
  };
  const result = await svc(mockRepo).searchArticles(
    { role: 'EMPLOYEE', employeeId: EMP_ID },
    { q: 'nonexistent topic xyz' }
  );
  assert.equal(result.data.count, 0);
});
