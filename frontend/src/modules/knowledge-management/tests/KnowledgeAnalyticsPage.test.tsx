import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import KnowledgeAnalyticsPage from '../pages/KnowledgeAnalyticsPage';

vi.mock('../hooks/useKnowledgeManagement', () => ({
  useKnowledgeAnalytics: vi.fn(),
}));

const { useKnowledgeAnalytics } = await import('../hooks/useKnowledgeManagement');

function wrapper(children: React.ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('KnowledgeAnalyticsPage', () => {
  it('renders page title', () => {
    vi.mocked(useKnowledgeAnalytics).mockReturnValue({ isLoading: true } as never);
    render(wrapper(<KnowledgeAnalyticsPage />));
    expect(screen.getByText('Knowledge Analytics')).toBeInTheDocument();
  });

  it('shows error state', () => {
    vi.mocked(useKnowledgeAnalytics).mockReturnValue({ isLoading: false, isError: true } as never);
    render(wrapper(<KnowledgeAnalyticsPage />));
    expect(screen.getByText(/Unable to load knowledge analytics/)).toBeInTheDocument();
  });

  it('renders metrics', () => {
    vi.mocked(useKnowledgeAnalytics).mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        totalArticles: 20,
        publishedArticles: 15,
        totalViews: 500,
        ticketDeflectionRate: 65,
        topRated: [],
        mostViewed: [],
        searchTrends: [],
        failedSearches: 5,
        successfulSearches: 10,
      },
    } as never);
    render(wrapper(<KnowledgeAnalyticsPage />));
    expect(screen.getByText('Total Articles').closest('div')?.textContent).toContain('20');
    expect(screen.getByText('Deflection Rate').closest('div')?.textContent).toContain('65%');
  });
});
