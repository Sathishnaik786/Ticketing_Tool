import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { GlobalSearch } from '../GlobalSearch';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({ user: { role: 'ADMIN' } })),
}));

vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: vi.fn(() => false),
}));

vi.mock('@/modules/ticketing/hooks/useTicketing', () => ({
  useTickets: vi.fn(() => ({ data: { data: [{ id: '1', title: 'Intellij activation issue', ticket_number: 'TKT-104' }] } })),
}));

vi.mock('@/modules/knowledge-management/hooks/useKnowledgeManagement', () => ({
  useKnowledgeArticles: vi.fn(() => ({ data: [{ id: 'art-1', title: 'VPN configuration guidelines' }] })),
}));

describe('GlobalSearch V2 Components', () => {
  const queryClient = new QueryClient();

  it('renders search input bar and opens results dropdown on focus', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <GlobalSearch />
        </MemoryRouter>
      </QueryClientProvider>
    );

    const input = screen.getByRole('combobox');
    expect(input).toBeInTheDocument();
    
    // Typing query triggers search
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'Intellij' } });

    expect(await screen.findByText('TKT-104: Intellij activation issue')).toBeInTheDocument();
  });
});
