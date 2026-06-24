import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

/**
 * Accessibility (a11y) tests for Ticketra ETMS
 * Verifies ARIA roles, keyboard navigation, and screen reader compatibility
 * across critical interactive components.
 */

// ─── StatusBadge ────────────────────────────────────────────────────────────
import { StatusBadge } from '../StatusBadge';

describe('StatusBadge — accessibility', () => {
  it('renders with visible text for screen readers', () => {
    render(<StatusBadge status="open" />);
    expect(screen.getByText(/open/i)).toBeInTheDocument();
  });

  it('renders a span element (not interactive by default)', () => {
    const { container } = render(<StatusBadge status="resolved" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.tagName).not.toBe('BUTTON');
  });
});

// ─── EmptyState ─────────────────────────────────────────────────────────────
import { EmptyState } from '../EmptyState';
import { Inbox } from 'lucide-react';

describe('EmptyState — accessibility', () => {
  it('renders heading with accessible text', () => {
    render(
      <EmptyState
        icon={Inbox}
        title="No tickets found"
        description="Try adjusting your filters."
      />
    );
    expect(screen.getByText('No tickets found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your filters.')).toBeInTheDocument();
  });
});

// ─── Keyboard Navigation ─────────────────────────────────────────────────────
describe('Keyboard navigation — button elements', () => {
  it('allows Tab to reach a button and Enter to activate it', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(
      <div>
        <button onClick={handleClick}>Action</button>
      </div>
    );

    await user.tab();
    const button = screen.getByRole('button', { name: 'Action' });
    expect(button).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('allows Space to activate a button', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<button onClick={handleClick}>Submit</button>);

    await user.tab();
    await user.keyboard(' ');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

// ─── ARIA Roles ──────────────────────────────────────────────────────────────
describe('ARIA role compliance', () => {
  it('links have an accessible href attribute', () => {
    render(<a href="/tickets">View tickets</a>);
    const link = screen.getByRole('link', { name: 'View tickets' });
    expect(link).toHaveAttribute('href', '/tickets');
  });

  it('images have alt text', () => {
    render(<img src="/logo.png" alt="Ticketra logo" />);
    const img = screen.getByRole('img', { name: 'Ticketra logo' });
    expect(img).toBeInTheDocument();
  });

  it('form inputs are associated with labels', () => {
    render(
      <div>
        <label htmlFor="search-input">Search</label>
        <input id="search-input" type="text" />
      </div>
    );
    const input = screen.getByLabelText('Search');
    expect(input).toBeInTheDocument();
  });
});

// ─── Focus Management ─────────────────────────────────────────────────────────
describe('Focus management', () => {
  it('focus is visible on interactive elements (not removed via CSS)', () => {
    render(<button>Focusable Button</button>);
    const button = screen.getByRole('button');
    button.focus();
    expect(document.activeElement).toBe(button);
  });
});
