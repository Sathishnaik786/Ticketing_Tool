import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ApprovalDashboardPage from '../pages/ApprovalDashboardPage';

vi.mock('../hooks/useApprovalManagement', () => ({
  useServiceCatalog: vi.fn(),
  usePendingApprovals: vi.fn(() => ({ isLoading: false, data: [] })),
}));

const { useServiceCatalog } = await import('../hooks/useApprovalManagement');

function wrapper(children: React.ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('ApprovalDashboardPage', () => {
  it('renders page title', () => {
    vi.mocked(useServiceCatalog).mockReturnValue({ isLoading: false, data: [] } as never);
    render(wrapper(<ApprovalDashboardPage />));
    expect(screen.getByText('Approval Dashboard')).toBeInTheDocument();
  });

  it('shows catalog empty state', () => {
    vi.mocked(useServiceCatalog).mockReturnValue({ isLoading: false, data: [] } as never);
    render(wrapper(<ApprovalDashboardPage />));
    expect(screen.getByText(/No service catalogs configured/)).toBeInTheDocument();
  });

  it('renders catalog items', () => {
    vi.mocked(useServiceCatalog).mockReturnValue({
      isLoading: false,
      data: [{
        id: 'c1',
        name: 'IT Services',
        category: 'IT',
        display_order: 1,
        is_active: true,
        items: [{ id: 'i1', catalog_id: 'c1', name: 'Laptop Request', requires_approval: true, is_active: true, display_order: 1 }],
      }],
    } as never);
    render(wrapper(<ApprovalDashboardPage />));
    expect(screen.getByText('Laptop Request')).toBeInTheDocument();
  });
});
