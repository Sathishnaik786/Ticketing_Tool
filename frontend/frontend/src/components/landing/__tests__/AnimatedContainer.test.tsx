/**
 * Property test for AnimatedContainer direction axis
 *
 * Property 7: AnimatedContainer configures correct animation axis for any direction
 * Validates: Requirements 18.8
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import * as fc from 'fast-check';

// ---------------------------------------------------------------------------
// Mock framer-motion so we can capture the `initial` and `animate` props
// passed to motion.div without needing a real animation runtime.
// ---------------------------------------------------------------------------
const capturedProps: Record<string, unknown>[] = [];

vi.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: {
      div: (props: Record<string, unknown>) => {
        // Capture the animation props for assertion
        capturedProps.push({
          initial: props.initial,
          animate: props.animate,
        });
        return React.createElement('div', {
          'data-testid': 'motion-div',
          className: props.className as string,
        }, props.children as React.ReactNode);
      },
    },
    useReducedMotion: () => false,
  };
});

// Import AFTER the mock is set up
import { AnimatedContainer } from '../AnimatedContainer';

describe('AnimatedContainer — Property 7: correct animation axis for any direction', () => {
  beforeEach(() => {
    // Clear captured props before each test run
    capturedProps.length = 0;
  });

  /**
   * **Validates: Requirements 18.8**
   *
   * Property A: For any direction value ('up', 'left', 'right'), the
   * AnimatedContainer must configure the Framer Motion `initial` state with
   * a non-zero offset on the correct axis:
   *   - 'up'    → initial.y === 30, initial.x === 0
   *   - 'left'  → initial.x === -40 (negative), initial.y === 0
   *   - 'right' → initial.x === 40 (positive), initial.y === 0
   *
   * The `animate` state must always be { opacity: 1, y: 0, x: 0 }.
   */
  it('Property A: initial state uses correct axis offset for each direction', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('up' as const, 'left' as const, 'right' as const),
        (direction) => {
          capturedProps.length = 0;

          render(
            <AnimatedContainer direction={direction}>
              <span>test child</span>
            </AnimatedContainer>
          );

          // The motion.div should have been rendered and props captured
          expect(capturedProps.length).toBeGreaterThan(0);

          const { initial, animate } = capturedProps[capturedProps.length - 1] as {
            initial: { opacity: number; y: number; x: number };
            animate: { opacity: number; y: number; x: number };
          };

          // Verify initial state per direction
          if (direction === 'up') {
            expect(initial.y).toBe(30);
            expect(initial.x).toBe(0);
          } else if (direction === 'left') {
            expect(initial.x).toBeLessThan(0); // negative
            expect(initial.x).toBe(-40);
            expect(initial.y).toBe(0);
          } else if (direction === 'right') {
            expect(initial.x).toBeGreaterThan(0); // positive
            expect(initial.x).toBe(40);
            expect(initial.y).toBe(0);
          }

          // Verify animate state is always { opacity: 1, y: 0, x: 0 }
          expect(animate).toEqual({ opacity: 1, y: 0, x: 0 });
        }
      )
    );
  });

  /**
   * **Validates: Requirements 18.8**
   *
   * Property B: The `animate` state is always { opacity: 1, y: 0, x: 0 }
   * regardless of direction — verified independently for clarity.
   */
  it('Property B: animate state is always { opacity: 1, y: 0, x: 0 } for all directions', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('up' as const, 'left' as const, 'right' as const),
        (direction) => {
          capturedProps.length = 0;

          render(
            <AnimatedContainer direction={direction}>
              <span>test child</span>
            </AnimatedContainer>
          );

          expect(capturedProps.length).toBeGreaterThan(0);

          const { animate } = capturedProps[capturedProps.length - 1] as {
            animate: { opacity: number; y: number; x: number };
          };

          expect(animate).toEqual({ opacity: 1, y: 0, x: 0 });
        }
      )
    );
  });

  /**
   * Edge case: default direction ('up') when no direction prop is provided.
   */
  it('uses "up" direction by default when direction prop is omitted', () => {
    render(
      <AnimatedContainer>
        <span>default direction</span>
      </AnimatedContainer>
    );

    expect(capturedProps.length).toBeGreaterThan(0);

    const { initial, animate } = capturedProps[capturedProps.length - 1] as {
      initial: { opacity: number; y: number; x: number };
      animate: { opacity: number; y: number; x: number };
    };

    expect(initial.y).toBe(30);
    expect(initial.x).toBe(0);
    expect(animate).toEqual({ opacity: 1, y: 0, x: 0 });
  });
});
