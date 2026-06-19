import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Sidebar } from '@/components/layout/sidebar/Sidebar';
import { Header } from '@/components/layout/Header';
import { GlobalSearch } from '@/components/common/GlobalSearch';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { TooltipProvider } from '@/components/ui/tooltip';

vi.mock('@/components/common/ChatDrawer', () => ({ ChatDrawer: () => null }));
vi.mock('@/components/common/OnlineIndicator', () => ({ OnlineIndicator: () => null }));
vi.mock('@/components/layout/DepartmentSelector', () => ({ DepartmentSelector: () => null }));
vi.mock('@/modules/notification-center/components/UnreadBadge', () => ({ UnreadBadge: () => null }));
vi.mock('@/components/common/NotificationBell', () => ({ NotificationBell: () => <button type="button" aria-label="Notifications">Bell</button> }));
vi.mock('@/components/layout/UnifiedNotificationTrigger', () => ({ UnifiedNotificationTrigger: () => <button type="button" aria-label="Notifications">Notify</button> }));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1', role: 'ADMIN', firstName: 'Test', lastName: 'Admin' },
    isLoading: false,
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

vi.mock('@/config/features', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/config/features')>();
  return {
    ...actual,
    isEtmsNavigationEnabled: false,
    isEtmsUiV2Enabled: false,
    isEtmsNotificationsEnabled: false,
    isNotificationCenterEnabled: false,
  };
});

function Shell({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/app/dashboard']}>
        <SidebarProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </SidebarProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('accessibility CI scans', () => {
  it('Sidebar has no critical axe violations', async () => {
    const { container } = render(<Shell><Sidebar /></Shell>);
    const results = await axe(container, { rules: { 'color-contrast': { enabled: false } } });
    const critical = results.violations.filter((v) => v.impact === 'critical');
    expect(critical).toHaveLength(0);
  });

  it('Header has no critical axe violations', async () => {
    const { container } = render(<Shell><Header /></Shell>);
    const results = await axe(container, {
      rules: {
        'color-contrast': { enabled: false },
        'aria-allowed-attr': { enabled: false },
      },
    });
    const critical = results.violations.filter((v) => v.impact === 'critical');
    expect(critical).toHaveLength(0);
  });

  it('GlobalSearch has no critical axe violations', async () => {
    const { container } = render(<Shell><GlobalSearch /></Shell>);
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    });
    const critical = results.violations.filter((v) => v.impact === 'critical');
    expect(critical).toHaveLength(0);
  });
});
