import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TicketFeedbackForm } from '../components/TicketFeedbackForm';

describe('TicketFeedbackForm', () => {
  it('disables submit until all ratings are selected', () => {
    render(<TicketFeedbackForm onSubmit={vi.fn()} />);
    expect(screen.getByRole('button', { name: /submit feedback/i })).toBeDisabled();
  });

  it('submits valid feedback payload', () => {
    const onSubmit = vi.fn();
    render(<TicketFeedbackForm onSubmit={onSubmit} />);

    const stars = screen.getAllByRole('button');
    fireEvent.click(stars[4]);
    fireEvent.click(stars[9]);
    fireEvent.click(stars[14]);
    fireEvent.click(stars[19]);

    fireEvent.change(screen.getByLabelText(/comments/i), {
      target: { value: 'Excellent support' },
    });

    fireEvent.click(screen.getByRole('button', { name: /submit feedback/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      rating: 5,
      resolution_quality: 5,
      communication_quality: 5,
      response_time: 5,
      comments: 'Excellent support',
    });
  });

  it('enforces 1000 character comment limit', () => {
    render(<TicketFeedbackForm onSubmit={vi.fn()} />);
    const textarea = screen.getByLabelText(/comments/i) as HTMLTextAreaElement;
    expect(textarea.maxLength).toBe(1000);
  });

  it('disables form when disabled prop is true', () => {
    render(<TicketFeedbackForm onSubmit={vi.fn()} disabled />);
    expect(screen.getByRole('button', { name: /submit feedback/i })).toBeDisabled();
  });
});
