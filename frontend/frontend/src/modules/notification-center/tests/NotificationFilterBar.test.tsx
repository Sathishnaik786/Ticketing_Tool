import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationFilterBar } from '../components/NotificationFilterBar';

describe('NotificationFilterBar', () => {
  const props = {
    status: 'all',
    priority: '',
    module: '',
    search: '',
    onStatusChange: vi.fn(),
    onPriorityChange: vi.fn(),
    onModuleChange: vi.fn(),
    onSearchChange: vi.fn(),
  };

  it('renders search input', () => {
    render(<NotificationFilterBar {...props} />);
    expect(screen.getByPlaceholderText('Search notifications...')).toBeInTheDocument();
  });

  it('calls onSearchChange', async () => {
    render(<NotificationFilterBar {...props} />);
    await userEvent.type(screen.getByPlaceholderText('Search notifications...'), 'sla');
    expect(props.onSearchChange).toHaveBeenCalled();
  });

  it('renders mark all read button', async () => {
    const onMarkAllRead = vi.fn();
    render(<NotificationFilterBar {...props} onMarkAllRead={onMarkAllRead} />);
    await userEvent.click(screen.getByText('Mark all read'));
    expect(onMarkAllRead).toHaveBeenCalled();
  });
});
