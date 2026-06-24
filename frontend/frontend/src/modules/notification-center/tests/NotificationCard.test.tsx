import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NotificationCard } from '../components/NotificationCard';

const notification = {
  id: 'n1',
  employee_id: 'e1',
  event_type: 'TICKET_ASSIGNED',
  title: 'Ticket Assigned',
  message: 'Ticket T-100 assigned',
  source_module: 'assignment',
  source_id: 's1',
  priority: 'HIGH' as const,
  status: 'ACTIVE',
  is_read: false,
  created_at: '2026-06-01T10:00:00.000Z',
};

describe('NotificationCard', () => {
  it('renders title and message', () => {
    render(<NotificationCard notification={notification} />);
    expect(screen.getByText('Ticket Assigned')).toBeInTheDocument();
    expect(screen.getByText('Ticket T-100 assigned')).toBeInTheDocument();
  });

  it('shows mark read button when unread', () => {
    const onMarkRead = vi.fn();
    render(<NotificationCard notification={notification} onMarkRead={onMarkRead} />);
    expect(screen.getByText('Mark read')).toBeInTheDocument();
  });

  it('hides mark read when already read', () => {
    render(<NotificationCard notification={{ ...notification, is_read: true }} onMarkRead={vi.fn()} />);
    expect(screen.queryByText('Mark read')).not.toBeInTheDocument();
  });
});
