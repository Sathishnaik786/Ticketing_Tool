import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import KnowledgeBasePage from '../pages/KnowledgeBasePage';

vi.mock('../hooks/useKnowledgeManagement', () => ({
  useKnowledgeCategories: vi.fn(),
  useKnowledgeArticles: vi.fn(),
  useKnowledgeSearch: vi.fn(() => ({ data: null, isLoading: false })),
}));

const { useKnowledgeCategories, useKnowledgeArticles } = await import('../hooks/useKnowledgeManagement');

function wrapper(children: React.ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('KnowledgeBasePage', () => {
  it('renders page title', () => {
    vi.mocked(useKnowledgeCategories).mockReturnValue({ data: [] } as never);
    vi.mocked(useKnowledgeArticles).mockReturnValue({ data: [], isLoading: false } as never);
    render(wrapper(<KnowledgeBasePage />));
    expect(screen.getByText('Knowledge Base')).toBeInTheDocument();
  });

  it('shows empty state', () => {
    vi.mocked(useKnowledgeCategories).mockReturnValue({ data: [] } as never);
    vi.mocked(useKnowledgeArticles).mockReturnValue({ data: [], isLoading: false } as never);
    render(wrapper(<KnowledgeBasePage />));
    expect(screen.getByText(/No articles available yet/)).toBeInTheDocument();
  });

  it('renders articles', () => {
    vi.mocked(useKnowledgeCategories).mockReturnValue({ data: [] } as never);
    vi.mocked(useKnowledgeArticles).mockReturnValue({
      data: [{
        id: 'a1', category_id: 'c1', title: 'VPN Guide', content: 'C', status: 'PUBLISHED',
        current_version: 1, created_at: '', updated_at: '',
      }],
      isLoading: false,
    } as never);
    render(wrapper(<KnowledgeBasePage />));
    expect(screen.getByText('VPN Guide')).toBeInTheDocument();
  });
});
