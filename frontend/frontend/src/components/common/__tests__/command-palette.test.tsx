import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { CommandPalette } from '../CommandPalette';

// Mock Command Context
vi.mock('@/contexts/CommandContext', () => ({
  useCommand: vi.fn(() => ({
    isOpen: true,
    setIsOpen: vi.fn(),
    query: '',
    setQuery: vi.fn(),
    commands: []
  })),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({ user: { role: 'ADMIN' } })),
}));

vi.mock('@/hooks/useNavigationHistory', () => ({
  useNavigationHistory: vi.fn(() => ({ history: [] })),
}));

// Mock tickerting hooks
vi.mock('@/modules/ticketing/hooks/useTicketing', () => ({
  useTickets: vi.fn(() => ({ data: { data: [] } })),
}));

vi.mock('@/modules/knowledge-management/hooks/useKnowledgeManagement', () => ({
  useKnowledgeArticles: vi.fn(() => ({ data: [] })),
}));

describe('CommandPalette Upgraded Panel', () => {
  it('renders command palette input and actions shortcuts on open', () => {
    render(
      <MemoryRouter>
        <CommandPalette />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText(/Search tickets, articles/)).toBeInTheDocument();
    expect(screen.getByText('Create Ticket')).toBeInTheDocument();
    expect(screen.getByText('Go to My Queue')).toBeInTheDocument();
  });
});
