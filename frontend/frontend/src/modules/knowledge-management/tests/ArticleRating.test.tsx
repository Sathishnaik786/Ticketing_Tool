import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ArticleRating } from '../components/ArticleRating';

vi.mock('../hooks/useKnowledgeManagement', () => ({
  useRateArticle: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

function wrapper(children: React.ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('ArticleRating', () => {
  it('renders rating heading', () => {
    render(wrapper(<ArticleRating articleId="a1" />));
    expect(screen.getByText('Rate this article')).toBeInTheDocument();
  });

  it('shows average rating', () => {
    render(wrapper(<ArticleRating articleId="a1" averageRating={4.2} ratingCount={8} />));
    expect(screen.getByText(/Average: 4.2/)).toBeInTheDocument();
  });

  it('renders five star buttons', () => {
    render(wrapper(<ArticleRating articleId="a1" />));
    expect(screen.getAllByRole('button', { name: /Rate \d stars/ })).toHaveLength(5);
  });
});
