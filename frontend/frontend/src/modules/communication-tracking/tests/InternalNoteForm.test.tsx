import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InternalNoteForm } from '../components/InternalNoteForm';

describe('InternalNoteForm', () => {
  it('renders internal note form', () => {
    render(<InternalNoteForm onSubmit={vi.fn()} />);
    expect(screen.getByLabelText('Internal note')).toBeInTheDocument();
  });

  it('requires message before submit', () => {
    render(<InternalNoteForm onSubmit={vi.fn()} />);
    expect(screen.getByRole('button', { name: /Add internal note/i })).toBeDisabled();
  });

  it('submits note', () => {
    const onSubmit = vi.fn();
    render(<InternalNoteForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText('Internal note'), { target: { value: 'Secret note' } });
    fireEvent.click(screen.getByRole('button', { name: /Add internal note/i }));
    expect(onSubmit).toHaveBeenCalledWith({ message: 'Secret note', subject: undefined });
  });
});
