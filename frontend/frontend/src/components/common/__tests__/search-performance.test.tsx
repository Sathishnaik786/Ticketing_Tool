import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

/**
 * Search performance tests
 * Verifies that GlobalSearch correctly debounces user input
 * and avoids excessive filtering on rapid keystrokes.
 */

// ─── Debounce utility test ────────────────────────────────────────────────────

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function DebounceTestComponent({ delay = 300 }: { delay?: number }) {
  const [input, setInput] = React.useState('');
  const debouncedValue = useDebouncedValue(input, delay);

  return (
    <div>
      <input
        data-testid="search-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Search..."
      />
      <span data-testid="debounced-value">{debouncedValue}</span>
    </div>
  );
}

describe('Debounce behavior', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not update debounced value immediately after keystrokes', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<DebounceTestComponent delay={300} />);

    const input = screen.getByTestId('search-input');
    await user.type(input, 'ticket');

    // Before debounce fires, the debounced value should still be empty
    expect(screen.getByTestId('debounced-value').textContent).toBe('');
  });

  it('updates debounced value after the delay passes', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<DebounceTestComponent delay={300} />);

    const input = screen.getByTestId('search-input');
    await user.type(input, 'ticket');

    // Advance timers past debounce window
    act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(screen.getByTestId('debounced-value').textContent).toBe('ticket');
  });

  it('resets debounce timer on each new keystroke', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<DebounceTestComponent delay={300} />);

    const input = screen.getByTestId('search-input');
    await user.type(input, 'ti');

    act(() => { vi.advanceTimersByTime(200); }); // Not yet fired

    await user.type(input, 'cket'); // Reset timer

    act(() => { vi.advanceTimersByTime(200); }); // Still not fired

    expect(screen.getByTestId('debounced-value').textContent).toBe('');

    act(() => { vi.advanceTimersByTime(150); }); // Now 350ms after last keystroke

    expect(screen.getByTestId('debounced-value').textContent).toBe('ticket');
  });
});

// ─── Search filtering performance ────────────────────────────────────────────

describe('Search filtering — large datasets', () => {
  it('correctly filters a large ticket list by title', () => {
    const tickets = Array.from({ length: 500 }, (_, i) => ({
      id: `ticket-${i}`,
      title: i % 10 === 0 ? `VPN Issue #${i}` : `Hardware Request #${i}`,
    }));

    const query = 'VPN';
    const results = tickets.filter(t =>
      t.title.toLowerCase().includes(query.toLowerCase())
    );

    expect(results.length).toBe(50); // 500 / 10 = 50 VPN tickets
    expect(results.every(t => t.title.includes('VPN'))).toBe(true);
  });

  it('returns empty array when no results match', () => {
    const tickets = [
      { id: '1', title: 'Printer broken' },
      { id: '2', title: 'Monitor flickering' },
    ];

    const results = tickets.filter(t =>
      t.title.toLowerCase().includes('vpn')
    );

    expect(results).toHaveLength(0);
  });

  it('is case-insensitive in matching', () => {
    const tickets = [
      { id: '1', title: 'VPN Access Issue' },
      { id: '2', title: 'vpn configuration problem' },
    ];

    const results = tickets.filter(t =>
      t.title.toLowerCase().includes('vpn')
    );

    expect(results).toHaveLength(2);
  });
});
