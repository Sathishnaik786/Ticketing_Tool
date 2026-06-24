/**
 * Property test for PremiumButton loading state
 *
 * Property 5: PremiumButton renders correct content for any isLoading state
 * Validates: Requirements 18.6
 */

import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, within } from '@testing-library/react';
import * as fc from 'fast-check';
import PremiumButton from '../PremiumButton';

// Ensure DOM is cleaned up between each test
afterEach(() => {
  cleanup();
});

describe('PremiumButton — Property 5: correct content for any isLoading state', () => {
  /**
   * **Validates: Requirements 18.6**
   *
   * For any isLoading boolean and any non-empty children string, when
   * isLoading is false the button must render the children text, and when
   * isLoading is true the button must render a loading indicator and
   * loadingText, and the button element must be disabled.
   */
  it('renders children text when isLoading is false for any children content', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        (childText) => {
          const { container } = render(
            <PremiumButton isLoading={false}>{childText}</PremiumButton>
          );
          const button = within(container).getByRole('button');

          // Children text must be visible in the rendered output
          expect(button.textContent).toContain(childText);
          // Button must NOT be disabled when not loading
          expect(button).not.toBeDisabled();

          cleanup();
        }
      )
    );
  });

  it('renders loading indicator and loadingText when isLoading is true for any loadingText', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        (childText, loadingText) => {
          const { container } = render(
            <PremiumButton isLoading={true} loadingText={loadingText}>
              {childText}
            </PremiumButton>
          );
          const button = within(container).getByRole('button');

          // loadingText must be visible
          expect(button.textContent).toContain(loadingText);

          // A loading spinner must be present — Loader2 renders as an svg with animate-spin class
          const spinner = container.querySelector('.animate-spin');
          expect(spinner).not.toBeNull();

          // Button must be disabled when loading
          expect(button).toBeDisabled();

          cleanup();
        }
      )
    );
  });

  it('does not render children text when isLoading is true', () => {
    fc.assert(
      fc.property(
        // Use a unique enough string to avoid accidental substring matches with loadingText
        fc.string({ minLength: 5 }).filter((s) => !s.includes('Loading')),
        (childText) => {
          const { container } = render(
            <PremiumButton isLoading={true} loadingText="Loading...">
              {childText}
            </PremiumButton>
          );
          const button = within(container).getByRole('button');

          // Children text must NOT appear when loading
          expect(button.textContent).not.toContain(childText);

          cleanup();
        }
      )
    );
  });

  it('button has disabled attribute when isLoading is true for any children', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        (childText) => {
          const { container } = render(
            <PremiumButton isLoading={true}>{childText}</PremiumButton>
          );
          const button = within(container).getByRole('button');

          expect(button).toBeDisabled();
          expect(button).toHaveAttribute('disabled');

          cleanup();
        }
      )
    );
  });

  it('uses default loadingText "Loading..." when no loadingText prop is provided', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        (childText) => {
          const { container } = render(
            <PremiumButton isLoading={true}>{childText}</PremiumButton>
          );
          const button = within(container).getByRole('button');

          expect(button.textContent).toContain('Loading...');

          cleanup();
        }
      )
    );
  });
});
