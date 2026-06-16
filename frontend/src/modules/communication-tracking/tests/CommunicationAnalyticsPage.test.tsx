import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CommunicationAnalyticsPage from '../pages/CommunicationAnalyticsPage';

vi.mock('../hooks/useCommunicationTracking', () => ({
  useCommunicationAnalytics: () => ({
    data: { data: { communicationByDepartment: [{ name: 'IT', count: 5 }] } },
  }),
}));

vi.mock('../components/CommunicationAnalyticsWidget', () => ({
  CommunicationAnalyticsWidget: () => <div>Analytics Widget</div>,
}));

describe('CommunicationAnalyticsPage', () => {
  it('renders analytics page', () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter>
          <CommunicationAnalyticsPage />
        </MemoryRouter>
      </QueryClientProvider>
    );
    expect(screen.getByText('Communication Analytics')).toBeInTheDocument();
    expect(screen.getByText('IT')).toBeInTheDocument();
  });
});
