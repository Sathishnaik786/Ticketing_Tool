import { toast } from 'sonner';
import { apiCall } from '@/services/api';
import { isKnowledgeBaseEnabled } from '@/config/features';

export type ArticleStatus = 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';
export type FeedbackType = 'GENERAL' | 'HELPFUL' | 'NOT_HELPFUL' | 'SUGGESTION';

export interface KnowledgeCategory {
  id: string;
  name: string;
  description?: string | null;
  category: string;
  display_order: number;
  is_active: boolean;
}

export interface KnowledgeArticle {
  id: string;
  category_id: string;
  title: string;
  summary?: string | null;
  content: string;
  status: ArticleStatus;
  author_id?: string | null;
  reviewer_id?: string | null;
  published_at?: string | null;
  current_version: number;
  attachments?: unknown[];
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface KnowledgeAnalytics {
  totalArticles: number;
  publishedArticles: number;
  totalViews: number;
  totalRatings: number;
  totalFeedback: number;
  topRated: Array<{ article_id: string; average: number; count: number; title: string }>;
  mostViewed: Array<{ article_id: string; views: number; title: string }>;
  searchTrends: Array<{ query: string; count: number }>;
  failedSearches: number;
  successfulSearches: number;
  ticketDeflectionRate: number;
}

function handleError(error: unknown): never {
  const err = error as Error & { status?: number };
  const messageByStatus: Record<number, string> = {
    401: 'Session expired. Please sign in again.',
    403: 'You do not have permission for this action.',
    404: 'Article not found.',
    422: err.message || 'Invalid request data.',
    503: 'Knowledge base module currently disabled.',
  };
  toast.error(messageByStatus[err.status ?? 0] || err.message || 'Something went wrong');
  throw err;
}

async function kbCall<T>(url: string, method: string, body?: unknown): Promise<T> {
  if (!isKnowledgeBaseEnabled) {
    const error = new Error('Knowledge base module currently disabled.') as Error & { status?: number };
    error.status = 503;
    handleError(error);
  }
  try {
    return (await apiCall(url, method, body)) as T;
  } catch (error) {
    handleError(error);
  }
}

export const knowledgeManagementApi = {
  getCategories: () =>
    kbCall<{ success: boolean; data: KnowledgeCategory[] }>('/knowledge/categories', 'GET'),

  listArticles: (params?: { category_id?: string; status?: ArticleStatus }) => {
    const qs = new URLSearchParams();
    if (params?.category_id) qs.set('category_id', params.category_id);
    if (params?.status) qs.set('status', params.status);
    const query = qs.toString();
    return kbCall<{ success: boolean; data: KnowledgeArticle[] }>(
      `/knowledge/articles${query ? `?${query}` : ''}`,
      'GET'
    );
  },

  getArticle: (id: string) =>
    kbCall<{ success: boolean; data: { article: KnowledgeArticle; tags: string[]; average_rating: number | null; rating_count: number; versions: unknown[] } }>(
      `/knowledge/articles/${id}`,
      'GET'
    ),

  createArticle: (payload: {
    category_id: string;
    title: string;
    summary?: string;
    content: string;
    tags?: string[];
    status?: 'DRAFT' | 'REVIEW';
  }) => kbCall<{ success: boolean; data: unknown }>('/knowledge/articles', 'POST', payload),

  updateArticle: (id: string, payload: Record<string, unknown>) =>
    kbCall<{ success: boolean; data: KnowledgeArticle }>(`/knowledge/articles/${id}`, 'PUT', payload),

  publishArticle: (id: string) =>
    kbCall<{ success: boolean; data: KnowledgeArticle }>(`/knowledge/articles/${id}/publish`, 'POST', {}),

  archiveArticle: (id: string) =>
    kbCall<{ success: boolean; data: KnowledgeArticle }>(`/knowledge/articles/${id}/archive`, 'POST', {}),

  rateArticle: (id: string, rating: number) =>
    kbCall<{ success: boolean; data: unknown }>(`/knowledge/articles/${id}/rate`, 'POST', { rating }),

  submitFeedback: (id: string, payload: { feedback_type?: FeedbackType; message: string }) =>
    kbCall<{ success: boolean; data: unknown }>(`/knowledge/articles/${id}/feedback`, 'POST', payload),

  search: (q: string, categoryId?: string) => {
    const qs = new URLSearchParams({ q });
    if (categoryId) qs.set('category_id', categoryId);
    return kbCall<{ success: boolean; data: { query: string; results: KnowledgeArticle[]; count: number } }>(
      `/knowledge/search?${qs.toString()}`,
      'GET'
    );
  },

  getRelated: (id: string) =>
    kbCall<{ success: boolean; data: KnowledgeArticle[] }>(`/knowledge/articles/${id}/related`, 'GET'),

  getAnalytics: () =>
    kbCall<{ success: boolean; data: KnowledgeAnalytics }>('/knowledge/analytics', 'GET'),
};
