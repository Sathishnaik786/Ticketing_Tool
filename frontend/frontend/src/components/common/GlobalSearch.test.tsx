import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({ user: { role: 'ADMIN' } })),
}));

vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: vi.fn(() => false),
}));

vi.mock('@/config/features', () => ({
  isEtmsNavigationEnabled: true,
  isFeatureFlagEnabled: (flag?: string) => {
    if (!flag) return true;
    return flag === 'VITE_ENABLE_TICKETING' || flag === 'VITE_ENABLE_ETMS_NAVIGATION';
  },
}));

describe('GlobalSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('shows registry results instead of mock data', async () => {
    const { GlobalSearch } = await import('./GlobalSearch');
    render(
      <MemoryRouter>
        <GlobalSearch />
      </MemoryRouter>
    );

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'my tickets' } });

    expect(await screen.findByText('My Tickets')).toBeInTheDocument();
    expect(screen.queryByText('Mock Employee')).not.toBeInTheDocument();
  });

  it('filters results by RBAC for employees', async () => {
    const { useAuth } = await import('@/contexts/AuthContext');
    vi.mocked(useAuth).mockReturnValue({ user: { role: 'EMPLOYEE' } } as ReturnType<typeof useAuth>);

    const { GlobalSearch } = await import('./GlobalSearch');
    render(
      <MemoryRouter>
        <GlobalSearch />
      </MemoryRouter>
    );

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'team tickets' } });
    expect(screen.queryByText('Team Tickets')).not.toBeInTheDocument();
  });

  it('shows suggestions when focused with empty query', async () => {
    const { GlobalSearch } = await import('./GlobalSearch');
    render(
      <MemoryRouter>
        <GlobalSearch />
      </MemoryRouter>
    );

    fireEvent.focus(screen.getByRole('combobox'));
    expect(await screen.findByText('my tickets')).toBeInTheDocument();
  });

  it('supports keyboard navigation', async () => {
    const { GlobalSearch } = await import('./GlobalSearch');
    render(
      <MemoryRouter>
        <GlobalSearch />
      </MemoryRouter>
    );

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    const options = await screen.findAllByRole('option');
    expect(options[0]).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    const updatedOptions = screen.getAllByRole('option');
    expect(updatedOptions[1]).toHaveAttribute('aria-selected', 'true');
  });
});
