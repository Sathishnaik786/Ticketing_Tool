/**
 * Unit tests for Navbar component
 *
 * Validates: Requirements 6.3, 6.5, 16.6
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Navbar } from '../../../pages/Landing';

// Mock next-themes to prevent ThemeToggle errors
vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'dark',
    setTheme: vi.fn(),
  }),
}));

describe('Navbar Component', () => {
  it('renders ThemeToggle in the Navbar', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    // Assert that the theme toggle button is rendered.
    // The ThemeToggle button has aria-label="Toggle Theme"
    const toggleButton = screen.getByRole('button', { name: /Toggle Theme/i });
    expect(toggleButton).toBeInTheDocument();
  });

  it('renders the CTA button containing orange gradient classes', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    // Get Started button
    const getStartedButtons = screen.getAllByRole('button', { name: /Get Started/i });
    // In mobile menu and desktop navbar, we might have multiple buttons or one visible
    expect(getStartedButtons.length).toBeGreaterThan(0);

    getStartedButtons.forEach((btn) => {
      // PremiumButton has "from-orange-600 to-orange-500" or similar orange gradient classes
      expect(btn.className).toContain('from-orange-600');
      expect(btn.className).toContain('to-orange-500');
    });
  });

  it('has correct aria-label for mobile menu toggle in open and closed states', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    // The mobile menu toggle button initially has aria-label="Open navigation menu"
    const toggleButton = screen.getByRole('button', { name: /Open navigation menu/i });
    expect(toggleButton).toBeInTheDocument();

    // Click to open mobile menu
    fireEvent.click(toggleButton);

    // Now it should have aria-label="Close navigation menu"
    expect(toggleButton).toHaveAttribute('aria-label', 'Close navigation menu');

    // Click again to close
    fireEvent.click(toggleButton);

    // Back to "Open navigation menu"
    expect(toggleButton).toHaveAttribute('aria-label', 'Open navigation menu');
  });
});
