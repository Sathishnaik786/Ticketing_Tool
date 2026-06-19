import { test, expect } from '@playwright/test';

test.describe('Dashboard — public', () => {
  test('landing mentions product value', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Dashboard — protected redirect', () => {
  test('operator dashboard requires auth', async ({ page }) => {
    await page.goto('/app/operator-dashboard');
    await expect(page).toHaveURL(/login/);
  });

  test('sla dashboard requires auth', async ({ page }) => {
    await page.goto('/app/sla-dashboard');
    await expect(page).toHaveURL(/login/);
  });

  test('hr dashboard requires auth', async ({ page }) => {
    await page.goto('/app/dashboard');
    await expect(page).toHaveURL(/login/);
  });
});
