const AppError = require('../../../utils/app-error');
const KnowledgeManagementRepository = require('../repositories/knowledge-management.repository');
const {
  parseSchema,
  CreateArticleSchema,
  UpdateArticleSchema,
  RateArticleSchema,
  ArticleFeedbackSchema,
  SearchSchema,
} = require('../validation/knowledge-management.validation');
const {
  ARTICLE_ADMIN_ROLES,
  ARTICLE_PUBLISH_ROLES,
  ARTICLE_AUTHOR_ROLES,
  ANALYTICS_ROLES,
} = require('../knowledge-management.constants');

function normalizeRole(role) {
  return String(role || 'EMPLOYEE').toUpperCase();
}

class KnowledgeManagementService {
  constructor(deps = {}) {
    this.repository = deps.repository || new KnowledgeManagementRepository(deps);
  }

  assertAuthor(user) {
    if (!ARTICLE_AUTHOR_ROLES.includes(normalizeRole(user.role))) {
      throw AppError.forbidden('You are not authorized to manage articles');
    }
  }

  assertPublish(user) {
    if (!ARTICLE_PUBLISH_ROLES.includes(normalizeRole(user.role))) {
      throw AppError.forbidden('Only managers and administrators can publish articles');
    }
  }

  assertAdmin(user) {
    if (!ARTICLE_ADMIN_ROLES.includes(normalizeRole(user.role))) {
      throw AppError.forbidden('Only administrators can manage categories');
    }
  }

  assertAnalytics(user) {
    if (!ANALYTICS_ROLES.includes(normalizeRole(user.role))) {
      throw AppError.forbidden('Insufficient permissions for knowledge analytics');
    }
  }

  canViewArticle(user, article) {
    const role = normalizeRole(user.role);
    if (ARTICLE_ADMIN_ROLES.includes(role) || ARTICLE_PUBLISH_ROLES.includes(role)) return true;
    return article.status === 'PUBLISHED';
  }

  canEditArticle(user, article) {
    const role = normalizeRole(user.role);
    if (ARTICLE_ADMIN_ROLES.includes(role)) return true;
    if (ARTICLE_PUBLISH_ROLES.includes(role)) return true;
    if (article.author_id && article.author_id === user.employeeId) {
      return ['DRAFT', 'REVIEW'].includes(article.status);
    }
    return false;
  }

  async getCategories() {
    const categories = await this.repository.listCategories();
    return { success: true, data: categories };
  }

  async listArticles(user, query = {}) {
    const role = normalizeRole(user.role);
    const canSeeAll = ARTICLE_ADMIN_ROLES.includes(role)
      || ARTICLE_PUBLISH_ROLES.includes(role);

    const filters = {};
    if (query.category_id) filters.category_id = query.category_id;
    if (query.status) filters.status = query.status;
    else if (!canSeeAll) filters.status = 'PUBLISHED';

    const articles = await this.repository.listArticles(filters);
    const enriched = await Promise.all(
      articles.map(async (article) => {
        const tags = await this.repository.getTags(article.id);
        return { ...article, tags: tags.map((t) => t.tag) };
      })
    );

    return { success: true, data: enriched };
  }

  async getArticle(user, articleId) {
    const article = await this.repository.getArticleById(articleId);
    if (!this.canViewArticle(user, article)) {
      throw AppError.forbidden('You do not have permission to view this article');
    }

    const [tags, versions, ratings] = await Promise.all([
      this.repository.getTags(articleId),
      this.repository.listVersions(articleId),
      this.repository.getRatings(articleId),
    ]);

    if (user.employeeId && article.status === 'PUBLISHED') {
      await this.repository.recordView({
        article_id: articleId,
        employee_id: user.employeeId,
      });
    }

    const avgRating = ratings.length
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : null;

    return {
      success: true,
      data: {
        article,
        tags: tags.map((t) => t.tag),
        versions,
        average_rating: avgRating,
        rating_count: ratings.length,
      },
    };
  }

  async createArticle(user, body) {
    this.assertAuthor(user);
    if (!user.employeeId) throw AppError.forbidden('Employee profile required');

    const input = parseSchema(CreateArticleSchema, body, 'Article');
    const { tags, ...articleRow } = input;

    const article = await this.repository.createArticle({
      ...articleRow,
      author_id: user.employeeId,
      current_version: 1,
    });

    await this.repository.replaceTags(article.id, tags);
    await this.repository.createVersion({
      article_id: article.id,
      version_number: 1,
      title: article.title,
      summary: article.summary,
      content: article.content,
      created_by: user.employeeId,
    });

    return { success: true, data: { article, tags } };
  }

  async updateArticle(user, articleId, body) {
    const existing = await this.repository.getArticleById(articleId);
    if (!this.canEditArticle(user, existing)) {
      throw AppError.forbidden('You are not authorized to edit this article');
    }

    const input = parseSchema(UpdateArticleSchema, body, 'Article');
    const { tags, ...articleRow } = input;

    if (articleRow.status === 'PUBLISHED') {
      this.assertPublish(user);
    }

    const article = await this.repository.updateArticle(articleId, articleRow);

    if (tags) await this.repository.replaceTags(articleId, tags);

    if (articleRow.title || articleRow.content || articleRow.summary) {
      const newVersion = existing.current_version + 1;
      await this.repository.updateArticle(articleId, { current_version: newVersion });
      await this.repository.createVersion({
        article_id: articleId,
        version_number: newVersion,
        title: article.title,
        summary: article.summary,
        content: article.content,
        created_by: user.employeeId || null,
      });
      article.current_version = newVersion;
    }

    return { success: true, data: article };
  }

  async publishArticle(user, articleId) {
    this.assertPublish(user);
    const article = await this.repository.getArticleById(articleId);
    if (article.status === 'ARCHIVED') {
      throw AppError.badRequest('Archived articles cannot be published directly');
    }

    const updated = await this.repository.updateArticle(articleId, {
      status: 'PUBLISHED',
      published_at: new Date().toISOString(),
      reviewer_id: user.employeeId || null,
    });

    return { success: true, data: updated };
  }

  async archiveArticle(user, articleId) {
    this.assertPublish(user);
    const updated = await this.repository.updateArticle(articleId, {
      status: 'ARCHIVED',
    });
    return { success: true, data: updated };
  }

  async rateArticle(user, articleId, body) {
    if (!user.employeeId) throw AppError.forbidden('Employee profile required');
    const article = await this.repository.getArticleById(articleId);
    if (article.status !== 'PUBLISHED') {
      throw AppError.badRequest('Only published articles can be rated');
    }

    const input = parseSchema(RateArticleSchema, body, 'Rating');
    const rating = await this.repository.upsertRating({
      article_id: articleId,
      employee_id: user.employeeId,
      rating: input.rating,
    });

    return { success: true, data: rating };
  }

  async submitFeedback(user, articleId, body) {
    const article = await this.repository.getArticleById(articleId);
    if (article.status !== 'PUBLISHED') {
      throw AppError.badRequest('Feedback is only accepted for published articles');
    }

    const input = parseSchema(ArticleFeedbackSchema, body, 'Feedback');
    const feedback = await this.repository.createFeedback({
      article_id: articleId,
      employee_id: user.employeeId || null,
      feedback_type: input.feedback_type,
      message: input.message,
    });

    return { success: true, data: feedback };
  }

  async searchArticles(user, queryParams) {
    const input = parseSchema(SearchSchema, queryParams, 'Search');
    const results = await this.repository.searchPublishedArticles(
      input.q,
      input.category_id,
      input.limit
    );

    const enriched = await Promise.all(
      results.map(async (article) => {
        const tags = await this.repository.getTags(article.id);
        return { ...article, tags: tags.map((t) => t.tag) };
      })
    );

    if (user.employeeId) {
      if (enriched.length === 0) {
        await this.repository.recordView({
          article_id: null,
          employee_id: user.employeeId,
          search_query: input.q,
        });
      } else {
        await this.repository.recordView({
          article_id: enriched[0].id,
          employee_id: user.employeeId,
          search_query: input.q,
        });
      }
    }

    return { success: true, data: { query: input.q, results: enriched, count: enriched.length } };
  }

  async getRelatedArticles(articleId, limit = 5) {
    const article = await this.repository.getArticleById(articleId);
    const tags = await this.repository.getTags(articleId);
    if (!tags.length) {
      const published = await this.repository.listPublishedArticles();
      return {
        success: true,
        data: published.filter((a) => a.id !== articleId).slice(0, limit),
      };
    }

    const tagName = tags[0].tag;
    const { data } = await this.repository.db
      .from('knowledge_article_tags')
      .select('article_id')
      .eq('tag', tagName);

    const relatedIds = (data || [])
      .map((r) => r.article_id)
      .filter((id) => id !== articleId)
      .slice(0, limit);

    if (!relatedIds.length) {
      return { success: true, data: [] };
    }

    const related = await Promise.all(relatedIds.map((id) => this.repository.getArticleById(id)));
    return {
      success: true,
      data: related.filter((a) => a.status === 'PUBLISHED'),
    };
  }

  async getAnalytics(user) {
    this.assertAnalytics(user);

    const [articles, views, ratings, feedback] = await Promise.all([
      this.repository.listArticles({}),
      this.repository.listAllViews(),
      this.repository.listAllRatings(),
      this.repository.listAllFeedback(),
    ]);

    const published = articles.filter((a) => a.status === 'PUBLISHED');
    const viewCounts = views.reduce((acc, v) => {
      if (v.article_id) acc[v.article_id] = (acc[v.article_id] || 0) + 1;
      return acc;
    }, {});

    const ratingAgg = ratings.reduce((acc, r) => {
      if (!acc[r.article_id]) acc[r.article_id] = { sum: 0, count: 0 };
      acc[r.article_id].sum += r.rating;
      acc[r.article_id].count += 1;
      return acc;
    }, {});

    const topRated = Object.entries(ratingAgg)
      .map(([id, { sum, count }]) => ({
        article_id: id,
        average: sum / count,
        count,
        title: articles.find((a) => a.id === id)?.title || 'Unknown',
      }))
      .sort((a, b) => b.average - a.average)
      .slice(0, 10);

    const mostViewed = Object.entries(viewCounts)
      .map(([id, count]) => ({
        article_id: id,
        views: count,
        title: articles.find((a) => a.id === id)?.title || 'Unknown',
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    const searchQueries = views.filter((v) => v.search_query);
    const searchTrends = searchQueries.reduce((acc, v) => {
      acc[v.search_query] = (acc[v.search_query] || 0) + 1;
      return acc;
    }, {});

    const failedSearches = views.filter((v) => !v.article_id && v.search_query).length;
    const successfulSearches = views.filter((v) => v.article_id && v.search_query).length;
    const deflectionRate = successfulSearches + failedSearches > 0
      ? Math.round((successfulSearches / (successfulSearches + failedSearches)) * 100)
      : 0;

    return {
      success: true,
      data: {
        totalArticles: articles.length,
        publishedArticles: published.length,
        totalViews: views.filter((v) => v.article_id).length,
        totalRatings: ratings.length,
        totalFeedback: feedback.length,
        topRated,
        mostViewed,
        searchTrends: Object.entries(searchTrends)
          .map(([query, count]) => ({ query, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 20),
        failedSearches,
        successfulSearches,
        ticketDeflectionRate: deflectionRate,
      },
    };
  }
}

module.exports = KnowledgeManagementService;
