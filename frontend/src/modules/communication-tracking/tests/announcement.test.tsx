import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import AnnouncementsPage from '../pages/AnnouncementsPage';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({ user: { id: 'u-1', firstName: 'Jane', role: 'ADMIN' } })),
}));

describe('Announcements Broadcasting Center Page', () => {
  const queryClient = new QueryClient();

  it('renders broadcasts bulletins, pinned badge, and tags', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AnnouncementsPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('Broadcast Announcements Center')).toBeInTheDocument();
    expect(screen.getByText('ETMS System Upgrade & Migration Scheduled')).toBeInTheDocument();
    expect(screen.getByText('Pinned')).toBeInTheDocument();
    expect(screen.getByText('URGENT')).toBeInTheDocument();
  });

  it('reveals comments drawer on click', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AnnouncementsPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    const commentsButton = screen.getByRole('button', { name: /2 Comments/ });
    expect(commentsButton).toBeInTheDocument();
    fireEvent.click(commentsButton);

    expect(await screen.findByText('Will active payroll tasks be impacted by the ticketing database upgrade?')).toBeInTheDocument();
  });
});
