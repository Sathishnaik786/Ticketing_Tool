import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ArticleFeedbackPanel } from '../components/ArticleFeedbackPanel';

vi.mock('../hooks/useKnowledgeManagement', () => ({
  useArticleFeedback: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

function wrapper(children: React.ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('ArticleFeedbackPanel', () => {
  it('renders feedback heading', () => {
    render(wrapper(<ArticleFeedbackPanel articleId="a1" />));
    expect(screen.getByText('Article Feedback')).toBeInTheDocument();
  });

  it('renders helpful button', () => {
    render(wrapper(<ArticleFeedbackPanel articleId="a1" />));
    expect(screen.getByText('Helpful')).toBeInTheDocument();
  });

  it('disables submit when message empty', () => {
    render(wrapper(<ArticleFeedbackPanel articleId="a1" />));
    expect(screen.getByText('Submit')).toBeDisabled();
  });
});
