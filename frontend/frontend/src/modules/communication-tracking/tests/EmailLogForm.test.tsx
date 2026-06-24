import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmailLogForm } from '../components/EmailLogForm';

describe('EmailLogForm', () => {
  it('renders email fields', () => {
    render(<EmailLogForm onSubmit={vi.fn()} />);
    expect(screen.getByLabelText(/^Sender$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Recipient$/i)).toBeInTheDocument();
  });

  it('submits valid email log', () => {
    const onSubmit = vi.fn();
    render(<EmailLogForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText(/^Sender$/i), { target: { value: 'a@x.com' } });
    fireEvent.change(screen.getByLabelText(/^Recipient$/i), { target: { value: 'b@x.com' } });
    fireEvent.change(screen.getByLabelText(/^Subject$/i), { target: { value: 'Update' } });
    fireEvent.change(screen.getByLabelText(/^Body$/i), { target: { value: 'Body text' } });
    fireEvent.click(screen.getByRole('button', { name: /Log email/i }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });
});
