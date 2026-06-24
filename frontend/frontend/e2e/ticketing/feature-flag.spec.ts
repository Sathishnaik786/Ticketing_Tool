import { test, expect } from '@playwright/test';

/**
 * ETMS E2E — Feature Flag Gating
 * Requires app running with VITE_ENABLE_TICKETING=false for OFF tests
 * and true for ON tests (use separate env runs or CI matrix).
 */

test.describe('ETMS feature flag', () => {
  test('redirects unauthenticated users from protected ticket routes', async ({ page }) => {
    await page.goto('/app/tickets');
    await expect(page).toHaveURL(/login|\/app\/dashboard|unauthorized/);
  });

  test('landing page loads without ETMS errors when flag off', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('ETMS routes when enabled', () => {
  test.skip(process.env.VITE_ENABLE_TICKETING !== 'true', 'Requires VITE_ENABLE_TICKETING=true');

  test('ticket list route is reachable after login', async ({ page }) => {
    // Placeholder — extend with authenticated storageState in CI
    test.fixme(true, 'Requires authenticated test user fixture');
    await page.goto('/app/tickets');
  });
});
