import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { KnowledgeSuggestionsPanel } from '../components/KnowledgeSuggestionsPanel';

vi.mock('@/config/features', () => ({ isKnowledgeBaseEnabled: true }));

vi.mock('../hooks/useKnowledgeManagement', () => ({
  useKnowledgeSearch: vi.fn(),
}));

const { useKnowledgeSearch } = await import('../hooks/useKnowledgeManagement');

describe('KnowledgeSuggestionsPanel', () => {
  beforeEach(() => {
    vi.mocked(useKnowledgeSearch).mockReturnValue({ data: null, isLoading: false } as never);
  });

  it('returns null when query too short', () => {
    render(
      <MemoryRouter><KnowledgeSuggestionsPanel searchQuery="ab" /></MemoryRouter>
    );
    expect(screen.queryByText('Possible Solutions Found')).not.toBeInTheDocument();
  });

  it('shows loading state', () => {
    vi.mocked(useKnowledgeSearch).mockReturnValue({ isLoading: true } as never);
    render(
      <MemoryRouter><KnowledgeSuggestionsPanel searchQuery="password reset help" /></MemoryRouter>
    );
    expect(screen.getByText(/Searching knowledge base/)).toBeInTheDocument();
  });

  it('shows no results message', () => {
    vi.mocked(useKnowledgeSearch).mockReturnValue({
      isLoading: false,
      data: { count: 0, results: [], query: 'xyz' },
    } as never);
    render(
      <MemoryRouter><KnowledgeSuggestionsPanel searchQuery="xyz unknown issue" /></MemoryRouter>
    );
    expect(screen.getByText(/No matching articles/)).toBeInTheDocument();
  });

  it('shows possible solutions heading', () => {
    vi.mocked(useKnowledgeSearch).mockReturnValue({
      isLoading: false,
      data: {
        count: 1,
        query: 'password',
        results: [{ id: 'a1', title: 'Password Reset', summary: 'Guide' }],
      },
    } as never);
    render(
      <MemoryRouter><KnowledgeSuggestionsPanel searchQuery="password reset" /></MemoryRouter>
    );
    expect(screen.getByText('Possible Solutions Found')).toBeInTheDocument();
    expect(screen.getByText('Password Reset')).toBeInTheDocument();
  });
});
