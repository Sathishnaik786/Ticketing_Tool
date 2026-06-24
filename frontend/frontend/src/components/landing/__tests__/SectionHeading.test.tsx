/**
 * Property test for SectionHeading accentWord highlighting
 *
 * Property 6: SectionHeading highlights accentWord in orange for any title
 * Validates: Requirements 18.7
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import * as fc from 'fast-check';
import SectionHeading from '../SectionHeading';

describe('SectionHeading — Property 6: accentWord highlighting for any title', () => {
  /**
   * **Validates: Requirements 18.7**
   *
   * Property A: For any title string (minLength 2) and any accentWord that is
   * a substring of that title, the rendered output must contain a <span> with
   * class `text-orange-500` whose text content equals the accentWord.
   */
  it('Property A: renders a text-orange-500 span containing accentWord when accentWord is a substring of title', () => {
    fc.assert(
      fc.property(
        // Generate a title of at least 2 characters
        fc.string({ minLength: 2 }),
        (title) => {
          // Derive accentWord as a non-empty substring of title
          // Pick a start index and a length that stays within bounds
          const startIdx = 0;
          const accentWord = title.slice(startIdx, Math.max(1, Math.ceil(title.length / 2)));

          // Guard: accentWord must be non-empty and a substring of title
          if (!accentWord || !title.includes(accentWord)) return;

          const { container } = render(
            <SectionHeading
              label="Test label"
              title={title}
              accentWord={accentWord}
            />
          );

          // Find all spans with text-orange-500 class
          const orangeSpans = container.querySelectorAll('span.text-orange-500');

          // At least one orange span must exist
          expect(orangeSpans.length).toBeGreaterThan(0);

          // One of those spans must contain the accentWord text
          const matchingSpan = Array.from(orangeSpans).find(
            (span) => span.textContent === accentWord
          );
          expect(matchingSpan).toBeDefined();
        }
      )
    );
  });

  /**
   * **Validates: Requirements 18.7**
   *
   * Property B: For any title and accentWord where accentWord is NOT a
   * substring of title, no <span> with class `text-orange-500` should be
   * present inside the <h2> element (the label span is outside h2 and uses
   * text-orange-500 for the label itself, so we scope the check to h2).
   */
  it('Property B: does not render a text-orange-500 span inside h2 when accentWord is not a substring of title', () => {
    fc.assert(
      fc.property(
        // Two independent strings; filter so accentWord is NOT a substring of title
        fc.string({ minLength: 1 }).filter((s) => s.length > 0),
        fc.string({ minLength: 1 }).filter((s) => s.length > 0),
        (title, accentWord) => {
          // Only run the assertion when accentWord is genuinely not in title
          if (title.includes(accentWord)) return;

          const { container } = render(
            <SectionHeading
              label="Test label"
              title={title}
              accentWord={accentWord}
            />
          );

          // Scope check to the h2 element to avoid the label span
          const h2 = container.querySelector('h2');
          expect(h2).not.toBeNull();

          const orangeSpansInH2 = h2!.querySelectorAll('span.text-orange-500');
          expect(orangeSpansInH2.length).toBe(0);
        }
      )
    );
  });

  /**
   * Additional edge-case: when accentWord prop is omitted entirely,
   * no orange span should appear inside the h2.
   */
  it('does not render a text-orange-500 span inside h2 when accentWord is not provided', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        (title) => {
          const { container } = render(
            <SectionHeading label="Test label" title={title} />
          );

          const h2 = container.querySelector('h2');
          expect(h2).not.toBeNull();

          const orangeSpansInH2 = h2!.querySelectorAll('span.text-orange-500');
          expect(orangeSpansInH2.length).toBe(0);
        }
      )
    );
  });
});
