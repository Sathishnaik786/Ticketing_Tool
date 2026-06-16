import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueueTicketTable } from '../components/QueueTicketTable';

describe('QueueTicketTable', () => {
  it('renders empty message when no tickets', () => {
    render(
      <MemoryRouter>
        <QueueTicketTable tickets={[]} emptyMessage="Queue empty" />
      </MemoryRouter>
    );
    expect(screen.getByText('Queue empty')).toBeInTheDocument();
  });

  it('renders ticket rows with title', () => {
    render(
      <MemoryRouter>
        <QueueTicketTable
          tickets={[
            {
              id: 't1',
              ticket_number: 'TKT-2026-00001',
              title: 'VPN issue',
              status: 'ASSIGNED',
              priority: 'HIGH',
              created_at: '2026-01-01T00:00:00.000Z',
              updated_at: '2026-01-02T00:00:00.000Z',
            },
          ]}
        />
      </MemoryRouter>
    );
    expect(screen.getByText('VPN issue')).toBeInTheDocument();
  });

  it('renders ticket link to detail page', () => {
    render(
      <MemoryRouter>
        <QueueTicketTable
          tickets={[
            {
              id: 't1',
              ticket_number: 'TKT-2026-00001',
              title: 'VPN issue',
              status: 'ASSIGNED',
              priority: 'HIGH',
              created_at: '2026-01-01T00:00:00.000Z',
              updated_at: '2026-01-02T00:00:00.000Z',
            },
          ]}
        />
      </MemoryRouter>
    );
    const link = screen.getByRole('link', { name: 'TKT-2026-00001' });
    expect(link).toHaveAttribute('href', '/app/tickets/t1');
  });
});
