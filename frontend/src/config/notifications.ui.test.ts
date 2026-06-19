import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('useUnifiedNotificationsUi', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns true only when both flags enabled', async () => {
    vi.stubEnv('VITE_ENABLE_ETMS_NOTIFICATIONS', 'true');
    vi.stubEnv('VITE_ENABLE_NOTIFICATION_CENTER', 'true');
    const { useUnifiedNotificationsUi } = await import('./notifications.ui');
    expect(useUnifiedNotificationsUi()).toBe(true);
  });

  it('returns false when ETMS notifications on but center off', async () => {
    vi.stubEnv('VITE_ENABLE_ETMS_NOTIFICATIONS', 'true');
    vi.stubEnv('VITE_ENABLE_NOTIFICATION_CENTER', 'false');
    const { useUnifiedNotificationsUi } = await import('./notifications.ui');
    expect(useUnifiedNotificationsUi()).toBe(false);
  });

  it('returns false when both off', async () => {
    vi.stubEnv('VITE_ENABLE_ETMS_NOTIFICATIONS', 'false');
    vi.stubEnv('VITE_ENABLE_NOTIFICATION_CENTER', 'false');
    const { useUnifiedNotificationsUi } = await import('./notifications.ui');
    expect(useUnifiedNotificationsUi()).toBe(false);
  });
});
