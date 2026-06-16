import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CallLogForm } from '../components/CallLogForm';

describe('CallLogForm', () => {
  it('renders form fields', () => {
    render(<CallLogForm onSubmit={vi.fn()} />);
    expect(screen.getByLabelText(/Customer name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Call start/i)).toBeInTheDocument();
  });

  it('submits with required fields', () => {
    const onSubmit = vi.fn();
    render(<CallLogForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText(/Call start/i), { target: { value: '2026-06-15T10:00' } });
    fireEvent.click(screen.getByRole('button', { name: /Log call/i }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('disables submit when submitting', () => {
    render(<CallLogForm onSubmit={vi.fn()} isSubmitting />);
    expect(screen.getByRole('button', { name: /Saving/i })).toBeDisabled();
  });
});
