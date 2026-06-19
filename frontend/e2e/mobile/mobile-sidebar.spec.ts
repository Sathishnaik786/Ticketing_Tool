import { test, expect } from '@playwright/test';

test.describe('Mobile sidebar — unauthenticated', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('login page renders on mobile', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('button', { name: /sign in|login/i })).toBeVisible();
  });

  test('landing renders on mobile', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Mobile — protected redirect', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('dashboard redirects to login on mobile', async ({ page }) => {
    await page.goto('/app/dashboard');
    await expect(page).toHaveURL(/login/);
  });
});
