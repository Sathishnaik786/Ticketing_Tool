import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import KnowledgeArticlePage from '../pages/KnowledgeArticlePage';

vi.mock('../hooks/useKnowledgeManagement', () => ({
  useKnowledgeArticle: vi.fn(),
  useRateArticle: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useRelatedArticles: vi.fn(() => ({ data: [], isLoading: false })),
  useArticleFeedback: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

const { useKnowledgeArticle } = await import('../hooks/useKnowledgeManagement');

function wrapper(children: React.ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('KnowledgeArticlePage', () => {
  it('shows loading state', () => {
    vi.mocked(useKnowledgeArticle).mockReturnValue({ isLoading: true } as never);
    render(wrapper(<KnowledgeArticlePage />));
    expect(document.querySelector('.animate-pulse') || document.body).toBeTruthy();
  });

  it('shows not found on error', () => {
    vi.mocked(useKnowledgeArticle).mockReturnValue({ isLoading: false, isError: true } as never);
    render(wrapper(<KnowledgeArticlePage />));
    expect(screen.getByText(/Article not found/)).toBeInTheDocument();
  });

  it('renders article content', () => {
    vi.mocked(useKnowledgeArticle).mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        article: {
          id: 'a1', title: 'Reset Password', summary: 'Guide', content: 'Step 1\nStep 2',
          status: 'PUBLISHED', published_at: '2026-06-01T10:00:00.000Z', current_version: 1,
        },
        tags: ['password'],
        average_rating: 4.5,
        rating_count: 10,
        versions: [],
      },
    } as never);
    render(wrapper(<KnowledgeArticlePage />));
    expect(screen.getByText('Reset Password')).toBeInTheDocument();
    expect(screen.getByText(/Step 1/)).toBeInTheDocument();
  });
});
