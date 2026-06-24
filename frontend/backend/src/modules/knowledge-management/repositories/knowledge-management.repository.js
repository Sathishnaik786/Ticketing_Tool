const AppError = require('../../../utils/app-error');

function handleDbError(error, notFoundMessage = 'Resource not found') {
  if (!error) return;
  if (error.code === 'PGRST116') {
    throw AppError.notFound(notFoundMessage);
  }
  throw AppError.internal('Unable to complete the requested operation');
}

class KnowledgeManagementRepository {
  constructor(deps = {}) {
    this.db = deps.supabaseAdmin || require('@lib/supabase').supabaseAdmin;
  }

  async listCategories() {
    const { data, error } = await this.db
      .from('knowledge_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    handleDbError(error);
    return data || [];
  }

  async listArticles(filters = {}) {
    let query = this.db.from('knowledge_articles').select('*');
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.category_id) query = query.eq('category_id', filters.category_id);
    query = query.order('updated_at', { ascending: false });
    const { data, error } = await query;
    handleDbError(error);
    return data || [];
  }

  async getArticleById(articleId) {
    const { data, error } = await this.db
      .from('knowledge_articles')
      .select('*')
      .eq('id', articleId)
      .maybeSingle();
    handleDbError(error, 'Article not found');
    if (!data) throw AppError.notFound('Article not found');
    return data;
  }

  async createArticle(row) {
    const { data, error } = await this.db
      .from('knowledge_articles')
      .insert(row)
      .select('*')
      .single();
    handleDbError(error);
    return data;
  }

  async updateArticle(articleId, row) {
    const { data, error } = await this.db
      .from('knowledge_articles')
      .update(row)
      .eq('id', articleId)
      .select('*')
      .single();
    handleDbError(error, 'Article not found');
    return data;
  }

  async getTags(articleId) {
    const { data, error } = await this.db
      .from('knowledge_article_tags')
      .select('*')
      .eq('article_id', articleId);
    handleDbError(error);
    return data || [];
  }

  async replaceTags(articleId, tags) {
    await this.db.from('knowledge_article_tags').delete().eq('article_id', articleId);
    if (!tags.length) return [];
    const rows = tags.map((tag) => ({ article_id: articleId, tag }));
    const { data, error } = await this.db.from('knowledge_article_tags').insert(rows).select('*');
    handleDbError(error);
    return data || [];
  }

  async createVersion(row) {
    const { data, error } = await this.db
      .from('knowledge_article_versions')
      .insert(row)
      .select('*')
      .single();
    handleDbError(error);
    return data;
  }

  async listVersions(articleId) {
    const { data, error } = await this.db
      .from('knowledge_article_versions')
      .select('*')
      .eq('article_id', articleId)
      .order('version_number', { ascending: false });
    handleDbError(error);
    return data || [];
  }

  async upsertRating(row) {
    const { data, error } = await this.db
      .from('knowledge_article_ratings')
      .upsert(row, { onConflict: 'article_id,employee_id' })
      .select('*')
      .single();
    handleDbError(error);
    return data;
  }

  async getRatings(articleId) {
    const { data, error } = await this.db
      .from('knowledge_article_ratings')
      .select('*')
      .eq('article_id', articleId);
    handleDbError(error);
    return data || [];
  }

  async recordView(row) {
    const { data, error } = await this.db
      .from('knowledge_article_views')
      .insert(row)
      .select('*')
      .single();
    handleDbError(error);
    return data;
  }

  async createFeedback(row) {
    const { data, error } = await this.db
      .from('knowledge_article_feedback')
      .insert(row)
      .select('*')
      .single();
    handleDbError(error);
    return data;
  }

  async searchPublishedArticles(query, categoryId, limit) {
    let dbQuery = this.db
      .from('knowledge_articles')
      .select('*')
      .eq('status', 'PUBLISHED')
      .or(`title.ilike.%${query}%,summary.ilike.%${query}%,content.ilike.%${query}%`)
      .limit(limit);
    if (categoryId) dbQuery = dbQuery.eq('category_id', categoryId);
    const { data, error } = await dbQuery;
    handleDbError(error);
    return data || [];
  }

  async listAllViews() {
    const { data, error } = await this.db.from('knowledge_article_views').select('*');
    handleDbError(error);
    return data || [];
  }

  async listAllRatings() {
    const { data, error } = await this.db.from('knowledge_article_ratings').select('*');
    handleDbError(error);
    return data || [];
  }

  async listAllFeedback() {
    const { data, error } = await this.db.from('knowledge_article_feedback').select('*');
    handleDbError(error);
    return data || [];
  }

  async listPublishedArticles() {
    return this.listArticles({ status: 'PUBLISHED' });
  }
}

module.exports = KnowledgeManagementRepository;
