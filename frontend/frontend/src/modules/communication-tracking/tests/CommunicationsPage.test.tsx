import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CommunicationsPage from '../pages/CommunicationsPage';

vi.mock('../hooks/useCommunicationTracking', () => ({
  useAddCommunicationComment: () => ({ mutate: vi.fn(), isPending: false }),
  useLogCommunicationCall: () => ({ mutate: vi.fn(), isPending: false }),
  useLogCommunicationEmail: () => ({ mutate: vi.fn(), isPending: false }),
  useAddInternalNote: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('../components/CommunicationPanel', () => ({
  CommunicationPanel: () => <div>Communication Panel Mock</div>,
}));

function renderPage() {
  const qc = new QueryClient();
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <CommunicationsPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('CommunicationsPage', () => {
  it('renders page header', () => {
    renderPage();
    expect(screen.getByText('Communications')).toBeInTheDocument();
  });

  it('shows ticket id input', () => {
    renderPage();
    expect(screen.getByLabelText(/Ticket ID/i)).toBeInTheDocument();
  });
});
