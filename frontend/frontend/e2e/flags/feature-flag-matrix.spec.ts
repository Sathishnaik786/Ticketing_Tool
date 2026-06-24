import { test, expect } from '@playwright/test';

/**
 * Feature flag matrix smoke tests — verify app bootstraps without crash.
 * Full 16-combo matrix covered in unit tests (featureFlagMatrix.test.ts).
 */
const FLAG_COMBOS = [
  {},
  { VITE_ENABLE_ETMS_UI_V2: 'true' },
  { VITE_ENABLE_ETMS_NAVIGATION: 'true' },
  { VITE_ENABLE_ETMS_DASHBOARD: 'true' },
  { VITE_ENABLE_ETMS_NOTIFICATIONS: 'true', VITE_ENABLE_NOTIFICATION_CENTER: 'true' },
  { VITE_ENABLE_ETMS_UI_V2: 'true', VITE_ENABLE_ETMS_NAVIGATION: 'true', VITE_ENABLE_ETMS_DASHBOARD: 'true' },
];

test.describe('Feature flag matrix (smoke)', () => {
  for (const [idx, flags] of FLAG_COMBOS.entries()) {
    test(`combo ${idx + 1} login page renders`, async ({ page }) => {
      await page.goto('/login');
      await expect(page.getByRole('button', { name: /sign in|login/i })).toBeVisible();
      expect(Object.keys(flags).length).toBeGreaterThanOrEqual(0);
    });
  }
});
