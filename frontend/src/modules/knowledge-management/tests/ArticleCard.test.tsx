import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ArticleCard } from '../components/ArticleCard';

const article = {
  id: 'a1',
  category_id: 'c1',
  title: 'Password Reset Guide',
  summary: 'How to reset your password',
  content: 'Steps...',
  status: 'PUBLISHED' as const,
  current_version: 1,
  tags: ['password', 'faq'],
  created_at: '2026-06-01T10:00:00.000Z',
  updated_at: '2026-06-01T10:00:00.000Z',
};

describe('ArticleCard', () => {
  it('renders title', () => {
    render(<MemoryRouter><ArticleCard article={article} /></MemoryRouter>);
    expect(screen.getByText('Password Reset Guide')).toBeInTheDocument();
  });

  it('renders status badge', () => {
    render(<MemoryRouter><ArticleCard article={article} /></MemoryRouter>);
    expect(screen.getByText('PUBLISHED')).toBeInTheDocument();
  });

  it('renders summary', () => {
    render(<MemoryRouter><ArticleCard article={article} /></MemoryRouter>);
    expect(screen.getByText(/How to reset your password/)).toBeInTheDocument();
  });

  it('renders tags', () => {
    render(<MemoryRouter><ArticleCard article={article} /></MemoryRouter>);
    expect(screen.getByText('password')).toBeInTheDocument();
  });
});
