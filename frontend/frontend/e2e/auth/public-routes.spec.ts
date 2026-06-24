import { test, expect } from '@playwright/test';

test.describe('Public routes', () => {
  test('landing page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/');
  });

  test('login page loads', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('button', { name: /sign in|login/i })).toBeVisible();
  });

  test('marketing pages do not 404', async ({ page }) => {
    for (const path of ['/workforce', '/about', '/enterprise-sla']) {
      const res = await page.goto(path);
      expect(res?.status()).toBeLessThan(400);
    }
  });
});

test.describe('Auth flows', () => {
  test('unauthenticated user redirected from /app', async ({ page }) => {
    await page.goto('/app/dashboard');
    await expect(page).toHaveURL(/login/);
  });

  test('forgot password page accessible', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.getByRole('heading')).toBeVisible();
  });
});
