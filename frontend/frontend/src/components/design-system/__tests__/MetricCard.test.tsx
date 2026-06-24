import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MetricCard } from '../MetricCard';
import { Ticket } from 'lucide-react';

describe('MetricCard', () => {
  it('renders label and value', () => {
    render(<MetricCard label="Open Tickets" value={42} icon={Ticket} tone="primary" />);
    expect(screen.getByText('Open Tickets')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('handles click', () => {
    const onClick = vi.fn();
    render(<MetricCard label="Clickable" value="5" onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('renders trend indicator', () => {
    render(
      <MetricCard
        label="SLA"
        value="94%"
        trend={{ value: '+2%', direction: 'up', label: 'vs last week' }}
      />
    );
    expect(screen.getByText(/\+2%/)).toBeInTheDocument();
  });
});
