import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StarRating } from '../components/StarRating';

describe('StarRating', () => {
  it('renders five stars', () => {
    render(<StarRating value={3} label="Overall Rating" />);
    expect(screen.getAllByRole('button')).toHaveLength(5);
    expect(screen.getByText('Overall Rating')).toBeInTheDocument();
  });

  it('calls onChange when star is clicked', () => {
    const onChange = vi.fn();
    render(<StarRating value={0} onChange={onChange} label="Rating" />);
    fireEvent.click(screen.getAllByRole('button')[4]);
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it('does not call onChange when disabled', () => {
    const onChange = vi.fn();
    render(<StarRating value={2} label="Rating" />);
    fireEvent.click(screen.getAllByRole('button')[3]);
    expect(onChange).not.toHaveBeenCalled();
  });
});
