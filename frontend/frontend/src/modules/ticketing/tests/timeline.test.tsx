import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TicketTimeline } from '../components/TicketTimeline';
import React from 'react';

const mockTimelineEntries = [
  {
    id: 'e-1',
    ticket_id: 't-1',
    activity_type: 'CREATED',
    description: 'Ticket created by Sam Lee',
    created_at: '2026-06-01T10:00:00.000Z',
    actor: { id: 'emp-2', first_name: 'Sam', last_name: 'Lee', email: 'sam@company.com' },
  },
  {
    id: 'e-2',
    ticket_id: 't-1',
    activity_type: 'ASSIGNMENT',
    description: 'Assigned to Jane Doe',
    created_at: '2026-06-01T10:05:00.000Z',
    actor: null, // System event representation
  },
];

describe('TicketTimeline Component', () => {
  it('renders a list of timeline events', () => {
    render(<TicketTimeline entries={mockTimelineEntries} />);

    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Ticket created by Sam Lee')).toBeInTheDocument();
    expect(screen.getByText('By Sam Lee')).toBeInTheDocument();

    expect(screen.getByText('Assigned')).toBeInTheDocument();
    expect(screen.getByText('Assigned to Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('By System')).toBeInTheDocument();
  });

  it('renders loading placeholder', () => {
    render(<TicketTimeline entries={[]} isLoading={true} />);
    expect(screen.queryByText('Created')).toBeNull();
  });

  it('renders empty message', () => {
    render(<TicketTimeline entries={[]} />);
    expect(screen.getByText('No timeline events recorded yet.')).toBeInTheDocument();
  });
});
