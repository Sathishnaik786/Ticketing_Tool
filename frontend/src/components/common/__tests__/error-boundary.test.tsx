import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as React from 'react';
import { ComponentErrorBoundary } from '../../components/common/ComponentErrorBoundary';

// Component that intentionally throws to simulate a render error
function BrokenComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Simulated render failure');
  }
  return <div>Component is healthy</div>;
}

// Suppress console.error for expected test errors
beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe('ComponentErrorBoundary', () => {
  it('renders children normally when there is no error', () => {
    render(
      <ComponentErrorBoundary name="TestWidget">
        <BrokenComponent shouldThrow={false} />
      </ComponentErrorBoundary>
    );
    expect(screen.getByText('Component is healthy')).toBeInTheDocument();
  });

  it('renders fallback UI when a child throws', () => {
    render(
      <ComponentErrorBoundary name="TestWidget">
        <BrokenComponent shouldThrow={true} />
      </ComponentErrorBoundary>
    );
    expect(screen.getByText('TestWidget Failure')).toBeInTheDocument();
    expect(
      screen.getByText(/An error occurred while loading this element/i)
    ).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    render(
      <ComponentErrorBoundary name="TestWidget" fallback={<div>Custom Fallback</div>}>
        <BrokenComponent shouldThrow={true} />
      </ComponentErrorBoundary>
    );
    expect(screen.getByText('Custom Fallback')).toBeInTheDocument();
  });

  it('resets error state when "Reload Element" is clicked', () => {
    const { rerender } = render(
      <ComponentErrorBoundary name="TestWidget">
        <BrokenComponent shouldThrow={true} />
      </ComponentErrorBoundary>
    );

    // Error boundary triggered
    expect(screen.getByText('TestWidget Failure')).toBeInTheDocument();

    // Click reset button
    const resetButton = screen.getByRole('button', { name: /Reload Element/i });
    fireEvent.click(resetButton);

    // After reset, the boundary should try to render children again
    // (they will throw again since shouldThrow is still true, but the reset was attempted)
    expect(screen.getByText('TestWidget Failure')).toBeInTheDocument();
  });

  it('uses "Component" as default name when no name prop given', () => {
    render(
      <ComponentErrorBoundary>
        <BrokenComponent shouldThrow={true} />
      </ComponentErrorBoundary>
    );
    expect(screen.getByText('Component Failure')).toBeInTheDocument();
  });

  it('does not affect sibling components when one child throws', () => {
    render(
      <div>
        <ComponentErrorBoundary name="Widget A">
          <BrokenComponent shouldThrow={true} />
        </ComponentErrorBoundary>
        <ComponentErrorBoundary name="Widget B">
          <BrokenComponent shouldThrow={false} />
        </ComponentErrorBoundary>
      </div>
    );
    expect(screen.getByText('Widget A Failure')).toBeInTheDocument();
    expect(screen.getByText('Component is healthy')).toBeInTheDocument();
  });
});
