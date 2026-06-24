import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EmployeeFeedbackWidget } from '../components/dashboard/EmployeeFeedbackWidget';

vi.mock('@/config/features', () => ({ isTicketFeedbackEnabled: true }));
vi.mock('../hooks/useTicketFeedback', () => ({
  useMyFeedbackCount: () => ({ data: { data: { count: 3 } }, isLoading: false }),
}));

describe('EmployeeFeedbackWidget', () => {
  it('renders submission count', () => {
    const client = new QueryClient();
    render(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <EmployeeFeedbackWidget />
        </MemoryRouter>
      </QueryClientProvider>
    );
    expect(screen.getByText('My Feedback Submitted')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('returns null when flag is off', async () => {
    vi.resetModules();
    vi.doMock('@/config/features', () => ({ isTicketFeedbackEnabled: false }));
    const { EmployeeFeedbackWidget: Widget } = await import('../components/dashboard/EmployeeFeedbackWidget');
    const { container } = render(<Widget />);
    expect(container.firstChild).toBeNull();
  });
});
