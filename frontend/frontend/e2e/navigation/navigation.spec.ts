import { test, expect } from '@playwright/test';

const NAV_PATHS = [
  '/login',
  '/',
  '/about',
  '/workforce',
  '/payroll',
  '/intelligence',
  '/governance',
  '/operations',
  '/security-standards',
  '/enterprise-sla',
  '/contact-sales',
  '/forgot-password',
];

test.describe('Navigation — public routes', () => {
  for (const path of NAV_PATHS) {
    test(`${path} responds without server error`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBeLessThan(500);
    });
  }
});

test.describe('Navigation — skip link', () => {
  test('login page is keyboard accessible', async ({ page }) => {
    await page.goto('/login');
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });
});

test.describe('Navigation — deep links', () => {
  test('reset password route exists', async ({ page }) => {
    const res = await page.goto('/reset-password');
    expect(res?.status()).toBeLessThan(500);
  });
});
