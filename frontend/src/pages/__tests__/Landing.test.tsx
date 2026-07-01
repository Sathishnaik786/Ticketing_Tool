/**
 * Tests for Landing page and FAQItem
 *
 * Validates: Requirements 2.5, 3.7, 4.1, 4.9, 11.5, 11.6, 16.1, 16.2, 16.3, 16.4, 16.7, 17.1, 17.4
 */

import React from 'react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { MemoryRouter } from 'react-router-dom';
import Landing, { FAQItem } from '../Landing';

// Mock IntersectionObserver for Framer Motion viewport triggers
beforeAll(() => {
  const mockIntersectionObserver = vi.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
  });
  window.IntersectionObserver = mockIntersectionObserver as any;
});

// Mock next-themes to prevent ThemeToggle errors
vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'dark',
    setTheme: vi.fn(),
  }),
}));

// Mock MegaMenu since it is lazy-loaded and not the focus of these tests
vi.mock('@/components/layout/MegaMenu', () => ({
  MegaMenu: () => <div data-testid="mock-mega-menu" />
}));

describe('FAQItem Component — Property 3: aria-expanded reflects open/closed state', () => {
  /**
   * Validates: Requirements 11.5, 11.6, 16.2
   *
   * For any random question and answer, the FAQItem button's aria-expanded
   * attribute must correctly reflect the visibility state of the details drawer.
   */
  it('correctly toggles aria-expanded and displays details on click', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        (question, answer) => {
          const { container } = render(
            <FAQItem question={question} answer={answer} />
          );
          const button = container.querySelector('button') as HTMLButtonElement;
          expect(button).toHaveAttribute('aria-expanded', 'false');

          // Click to open
          fireEvent.click(button);
          expect(button).toHaveAttribute('aria-expanded', 'true');

          // Click to close
          fireEvent.click(button);
          expect(button).toHaveAttribute('aria-expanded', 'false');
        }
      )
    );
  });
});

describe('Landing Page — Property 1: No teal color classes remain after migration', () => {
  /**
   * Validates: Requirements 4.1, 4.9
   */
  it('renders all elements in the tree with zero teal or legacy glass classes', () => {
    const { container } = render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );

    const allElements = Array.from(container.querySelectorAll('*'));
    if (allElements.length > 0) {
      fc.assert(
        fc.property(
          fc.constantFrom(...allElements),
          (element) => {
            const className = element.className;
            if (className && typeof className === 'string') {
              const forbidden = ['teal-500', 'teal-400', 'teal-300', 'glass-panel', 'glass-panel-teal'];
              forbidden.forEach((cls) => {
                expect(className).not.toContain(cls);
              });
            }
          }
        )
      );
    }
  });
});

describe('Landing Page — Property 4: Image elements lazy load and have descriptive alt text', () => {
  /**
   * Validates: Requirements 16.3, 17.1
   */
  it('has loading="lazy" and descriptive alt attribute for all images in the page', () => {
    const { container } = render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );

    const allImages = Array.from(container.querySelectorAll('img'));
    if (allImages.length > 0) {
      fc.assert(
        fc.property(
          fc.constantFrom(...allImages),
          (img) => {
            // Assert lazy loading is present
            expect(img).toHaveAttribute('loading', 'lazy');

            // Assert descriptive alt text is present
            const alt = img.getAttribute('alt');
            expect(alt).toBeTruthy();
            expect(alt?.trim()).not.toBe('');

            const genericWords = ['image', 'photo', 'picture', 'img'];
            const lowerAlt = alt?.toLowerCase().trim() || '';
            expect(genericWords).not.toContain(lowerAlt);
          }
        )
      );
    }
  });
});

describe('Landing Page — Property 8: Focus ring on all interactive elements', () => {
  /**
   * Validates: Requirements 16.4
   */
  it('contains focus-visible ring styles on all buttons and links in the Landing page', () => {
    const { container } = render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );

    // Select standard interactive element types
    const interactive = Array.from(container.querySelectorAll('button, a'));
    if (interactive.length > 0) {
      fc.assert(
        fc.property(
          fc.constantFrom(...interactive),
          (el) => {
            const className = el.className;
            expect(className).toContain('focus-visible:ring-2');
            expect(className).toContain('focus-visible:ring-blue-500/50');
          }
        )
      );
    }
  });
});

describe('Landing Page — Accessibility Landmark and Skip Invariants', () => {
  /**
   * Validates: Requirements 16.1, 16.7
   */
  it('renders skip-to-content link as the first focusable element linking to main-content', () => {
    const { container } = render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );

    const firstLink = container.querySelector('a');
    expect(firstLink).toHaveAttribute('href', '#main-content');
    expect(firstLink?.textContent?.toLowerCase()).toContain('skip to main content');
    expect(firstLink?.className).toContain('sr-only');
    expect(firstLink?.className).toContain('focus:not-sr-only');
  });

  it('renders a main landmark with id="main-content"', () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );

    const mainElement = screen.getByRole('main');
    expect(mainElement).toHaveAttribute('id', 'main-content');
  });

  it('renders stats strip items inside wrapper with aria-live="polite" and aria-atomic="true"', () => {
    const { container } = render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );

    // Stats strip section wraps items with aria-live="polite"
    const liveRegions = container.querySelectorAll('[aria-live="polite"]');
    expect(liveRegions.length).toBe(4);
    liveRegions.forEach((region) => {
      expect(region).toHaveAttribute('aria-atomic', 'true');
    });
  });
});
