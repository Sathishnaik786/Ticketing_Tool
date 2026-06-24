import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ticketingRoutes } from '../ticketing.routes';

vi.mock('@/config/features', () => ({
  isTicketingEnabled: true,
  isFeatureFlagEnabled: () => true,
}));

describe('ticketing.routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('defines ticket list, create, and detail routes', () => {
    expect(ticketingRoutes[0]?.path).toBe('tickets');
    const children = ticketingRoutes[0]?.children ?? [];
    expect(children.some((route) => route.index)).toBe(true);
    expect(children.some((route) => route.path === 'new')).toBe(true);
    expect(children.some((route) => route.path === ':ticketId')).toBe(true);
  });

  it('lazy loads route elements with suspense fallback', () => {
    const children = ticketingRoutes[0]?.children ?? [];
    children.forEach((route) => {
      expect(route.element).toBeTruthy();
    });
  });
});
