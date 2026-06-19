import { describe, it, expect, vi } from 'vitest';

vi.mock('@/config/features', () => ({
  isTicketFeedbackEnabled: true,
  isFeatureFlagEnabled: () => true,
}));

describe('ticketFeedbackRoutes', () => {
  it('exports feedback analytics route', async () => {
    const { ticketFeedbackRoutes } = await import('../ticket-feedback.routes');
    expect(ticketFeedbackRoutes[0]?.path).toBe('feedback-analytics');
    expect(ticketFeedbackRoutes[0]?.element).toBeTruthy();
  });
});

describe('ticketFeedbackService', () => {
  it('blocks API calls when feature flag is off', async () => {
    vi.resetModules();
    vi.doMock('@/config/features', () => ({ isTicketFeedbackEnabled: false }));
    vi.doMock('@/services/api', () => ({ apiCall: vi.fn() }));

    const { ticketFeedbackApi } = await import('../services/ticketFeedbackService');
    await expect(ticketFeedbackApi.getMetrics()).rejects.toMatchObject({ status: 503 });
  });
});
