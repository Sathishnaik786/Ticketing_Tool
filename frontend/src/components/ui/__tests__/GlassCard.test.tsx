/**
 * Property test for GlassCard variant classes
 *
 * Property 2: GlassCard always renders with correct glass classes for any variant
 * Validates: Requirements 5.1, 18.5
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import * as fc from 'fast-check';
import { GlassCard } from '../GlassCard';

describe('GlassCard — Property 2: correct glass classes for any variant', () => {
  /**
   * Validates: Requirements 5.1, 18.5
   *
   * For any valid variant and any non-empty children string, the rendered
   * wrapper div must always contain the invariant glass classes
   * (backdrop-blur-3xl, rounded-[2rem]) and the variant-specific bg class(es).
   */
  it('always has backdrop-blur-3xl and rounded-[2rem] for any variant and content', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('light' as const, 'dark' as const, 'auto' as const),
        fc.string({ minLength: 1 }),
        (variant, content) => {
          const { container } = render(
            <GlassCard variant={variant}>{content}</GlassCard>
          );
          const wrapper = container.firstElementChild as HTMLElement;
          const className = wrapper.className;

          // Invariant classes — must be present for every variant
          expect(className).toContain('backdrop-blur-3xl');
          expect(className).toContain('rounded-[2rem]');
        }
      )
    );
  });

  it('has bg-white/[0.22] for the "light" variant', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        (content) => {
          const { container } = render(
            <GlassCard variant="light">{content}</GlassCard>
          );
          const wrapper = container.firstElementChild as HTMLElement;
          const className = wrapper.className;

          expect(className).toContain('bg-white/[0.22]');
          // Light variant must NOT force dark bg class
          expect(className).not.toContain('bg-slate-950/[0.22]');
        }
      )
    );
  });

  it('has bg-slate-950/[0.22] for the "dark" variant', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        (content) => {
          const { container } = render(
            <GlassCard variant="dark">{content}</GlassCard>
          );
          const wrapper = container.firstElementChild as HTMLElement;
          const className = wrapper.className;

          expect(className).toContain('bg-slate-950/[0.22]');
          // Dark variant must NOT force light bg class (without dark: prefix)
          // The class string should not contain a bare bg-white/[0.22] without dark: prefix
          // We check the raw class tokens to ensure no bare light bg is present
          const tokens = className.split(' ');
          const hasBareWhiteBg = tokens.some(
            (t) => t === 'bg-white/[0.22]'
          );
          expect(hasBareWhiteBg).toBe(false);
        }
      )
    );
  });

  it('has both bg-white/[0.22] and dark:bg-slate-950/[0.22] for the "auto" variant', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        (content) => {
          const { container } = render(
            <GlassCard variant="auto">{content}</GlassCard>
          );
          const wrapper = container.firstElementChild as HTMLElement;
          const className = wrapper.className;

          // Auto variant uses both light and dark bg classes via Tailwind dark: prefix
          expect(className).toContain('bg-white/[0.22]');
          expect(className).toContain('dark:bg-slate-950/[0.22]');
        }
      )
    );
  });

  it('defaults to "auto" variant when no variant prop is provided', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        (content) => {
          const { container } = render(<GlassCard>{content}</GlassCard>);
          const wrapper = container.firstElementChild as HTMLElement;
          const className = wrapper.className;

          // Default (auto) must have invariant classes
          expect(className).toContain('backdrop-blur-3xl');
          expect(className).toContain('rounded-[2rem]');
          // And both light + dark bg classes
          expect(className).toContain('bg-white/[0.22]');
          expect(className).toContain('dark:bg-slate-950/[0.22]');
        }
      )
    );
  });

  it('passes additional className through without removing glass classes', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('light' as const, 'dark' as const, 'auto' as const),
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        (variant, content, extraClass) => {
          // Avoid class names that could conflict with the glass classes
          const safeExtra = `extra-${extraClass.replace(/[^a-zA-Z0-9-]/g, '')}`;
          const { container } = render(
            <GlassCard variant={variant} className={safeExtra}>
              {content}
            </GlassCard>
          );
          const wrapper = container.firstElementChild as HTMLElement;
          const className = wrapper.className;

          // Glass invariants must still be present even with extra className
          expect(className).toContain('backdrop-blur-3xl');
          expect(className).toContain('rounded-[2rem]');
        }
      )
    );
  });
});
