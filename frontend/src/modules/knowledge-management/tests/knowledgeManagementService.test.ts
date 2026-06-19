import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/services/api', () => ({ apiCall: vi.fn() }));
vi.mock('@/config/features', () => ({ isKnowledgeBaseEnabled: true }));

describe('knowledgeManagementApi', () => {
  beforeEach(async () => {
    vi.resetModules();
    const { apiCall } = await import('@/services/api');
    vi.mocked(apiCall).mockReset();
  });

  it('getCategories calls correct endpoint', async () => {
    const { apiCall } = await import('@/services/api');
    vi.mocked(apiCall).mockResolvedValue({ success: true, data: [] });
    const { knowledgeManagementApi } = await import('../services/knowledgeManagementService');
    await knowledgeManagementApi.getCategories();
    expect(apiCall).toHaveBeenCalledWith('/knowledge/categories', 'GET', undefined);
  });

  it('listArticles calls articles endpoint', async () => {
    const { apiCall } = await import('@/services/api');
    vi.mocked(apiCall).mockResolvedValue({ success: true, data: [] });
    const { knowledgeManagementApi } = await import('../services/knowledgeManagementService');
    await knowledgeManagementApi.listArticles();
    expect(apiCall).toHaveBeenCalledWith('/knowledge/articles', 'GET', undefined);
  });

  it('getArticle calls article by id', async () => {
    const { apiCall } = await import('@/services/api');
    vi.mocked(apiCall).mockResolvedValue({ success: true, data: {} });
    const { knowledgeManagementApi } = await import('../services/knowledgeManagementService');
    await knowledgeManagementApi.getArticle('art-1');
    expect(apiCall).toHaveBeenCalledWith('/knowledge/articles/art-1', 'GET', undefined);
  });

  it('createArticle posts payload', async () => {
    const { apiCall } = await import('@/services/api');
    vi.mocked(apiCall).mockResolvedValue({ success: true, data: {} });
    const { knowledgeManagementApi } = await import('../services/knowledgeManagementService');
    const payload = { category_id: 'c1', title: 'T', content: 'C' };
    await knowledgeManagementApi.createArticle(payload);
    expect(apiCall).toHaveBeenCalledWith('/knowledge/articles', 'POST', payload);
  });

  it('publishArticle posts to publish endpoint', async () => {
    const { apiCall } = await import('@/services/api');
    vi.mocked(apiCall).mockResolvedValue({ success: true, data: {} });
    const { knowledgeManagementApi } = await import('../services/knowledgeManagementService');
    await knowledgeManagementApi.publishArticle('art-1');
    expect(apiCall).toHaveBeenCalledWith('/knowledge/articles/art-1/publish', 'POST', {});
  });

  it('rateArticle posts rating', async () => {
    const { apiCall } = await import('@/services/api');
    vi.mocked(apiCall).mockResolvedValue({ success: true, data: {} });
    const { knowledgeManagementApi } = await import('../services/knowledgeManagementService');
    await knowledgeManagementApi.rateArticle('art-1', 5);
    expect(apiCall).toHaveBeenCalledWith('/knowledge/articles/art-1/rate', 'POST', { rating: 5 });
  });

  it('search calls search endpoint with query', async () => {
    const { apiCall } = await import('@/services/api');
    vi.mocked(apiCall).mockResolvedValue({ success: true, data: { results: [], count: 0 } });
    const { knowledgeManagementApi } = await import('../services/knowledgeManagementService');
    await knowledgeManagementApi.search('password');
    expect(apiCall).toHaveBeenCalledWith('/knowledge/search?q=password', 'GET', undefined);
  });

  it('getAnalytics calls analytics endpoint', async () => {
    const { apiCall } = await import('@/services/api');
    vi.mocked(apiCall).mockResolvedValue({ success: true, data: {} });
    const { knowledgeManagementApi } = await import('../services/knowledgeManagementService');
    await knowledgeManagementApi.getAnalytics();
    expect(apiCall).toHaveBeenCalledWith('/knowledge/analytics', 'GET', undefined);
  });

  it('throws 503 when feature flag disabled', async () => {
    vi.doMock('@/config/features', () => ({ isKnowledgeBaseEnabled: false }));
    const { knowledgeManagementApi } = await import('../services/knowledgeManagementService');
    await expect(knowledgeManagementApi.getCategories()).rejects.toMatchObject({ status: 503 });
  });
});
