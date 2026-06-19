import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RouteGuard } from './RouteGuard';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '@/contexts/AuthContext';

describe('RouteGuard', () => {
  it('renders children when role is allowed', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { role: 'ADMIN' },
      isLoading: false,
    } as ReturnType<typeof useAuth>);

    render(
      <MemoryRouter>
        <RouteGuard allowedRoles={['ADMIN']}>
          <div>Protected content</div>
        </RouteGuard>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('redirects employees from admin-only routes', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { role: 'EMPLOYEE' },
      isLoading: false,
    } as ReturnType<typeof useAuth>);

    render(
      <MemoryRouter initialEntries={['/app/admin/users']}>
        <RouteGuard allowedRoles={['ADMIN']}>
          <div>Protected content</div>
        </RouteGuard>
      </MemoryRouter>
    );

    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('maps SUPER_ADMIN to ADMIN for access checks', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { role: 'SUPER_ADMIN' },
      isLoading: false,
    } as ReturnType<typeof useAuth>);

    render(
      <MemoryRouter>
        <RouteGuard allowedRoles={['ADMIN']}>
          <div>Admin content</div>
        </RouteGuard>
      </MemoryRouter>
    );

    expect(screen.getByText('Admin content')).toBeInTheDocument();
  });
});
