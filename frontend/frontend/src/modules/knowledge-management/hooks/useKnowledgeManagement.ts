import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { knowledgeManagementApi, type ArticleStatus } from '../services/knowledgeManagementService';

export const knowledgeQueryKeys = {
  categories: ['knowledge-categories'] as const,
  articles: (filters?: { category_id?: string; status?: ArticleStatus }) =>
    ['knowledge-articles', filters] as const,
  article: (id: string) => ['knowledge-article', id] as const,
  search: (q: string) => ['knowledge-search', q] as const,
  related: (id: string) => ['knowledge-related', id] as const,
  analytics: ['knowledge-analytics'] as const,
};

export function useKnowledgeCategories() {
  return useQuery({
    queryKey: knowledgeQueryKeys.categories,
    queryFn: async () => (await knowledgeManagementApi.getCategories()).data,
  });
}

export function useKnowledgeArticles(filters?: { category_id?: string; status?: ArticleStatus }) {
  return useQuery({
    queryKey: knowledgeQueryKeys.articles(filters),
    queryFn: async () => (await knowledgeManagementApi.listArticles(filters)).data,
  });
}

export function useKnowledgeArticle(id: string) {
  return useQuery({
    queryKey: knowledgeQueryKeys.article(id),
    queryFn: async () => (await knowledgeManagementApi.getArticle(id)).data,
    enabled: Boolean(id),
  });
}

export function useKnowledgeSearch(query: string, enabled = true) {
  return useQuery({
    queryKey: knowledgeQueryKeys.search(query),
    queryFn: async () => (await knowledgeManagementApi.search(query)).data,
    enabled: enabled && query.trim().length >= 2,
  });
}

export function useRelatedArticles(articleId: string) {
  return useQuery({
    queryKey: knowledgeQueryKeys.related(articleId),
    queryFn: async () => (await knowledgeManagementApi.getRelated(articleId)).data,
    enabled: Boolean(articleId),
  });
}

export function useKnowledgeAnalytics() {
  return useQuery({
    queryKey: knowledgeQueryKeys.analytics,
    queryFn: async () => (await knowledgeManagementApi.getAnalytics()).data,
  });
}

export function useCreateArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: knowledgeManagementApi.createArticle,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['knowledge-articles'] }),
  });
}

export function useUpdateArticle(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => knowledgeManagementApi.updateArticle(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: knowledgeQueryKeys.article(id) });
      qc.invalidateQueries({ queryKey: ['knowledge-articles'] });
    },
  });
}

export function usePublishArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => knowledgeManagementApi.publishArticle(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['knowledge-articles'] }),
  });
}

export function useRateArticle(articleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rating: number) => knowledgeManagementApi.rateArticle(articleId, rating),
    onSuccess: () => qc.invalidateQueries({ queryKey: knowledgeQueryKeys.article(articleId) }),
  });
}

export function useArticleFeedback(articleId: string) {
  return useMutation({
    mutationFn: (payload: { feedback_type?: string; message: string }) =>
      knowledgeManagementApi.submitFeedback(articleId, payload),
  });
}
