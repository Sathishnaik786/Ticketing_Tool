import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';

test.describe('RBAC enforcement', () => {
  test('employee cannot access admin users', async ({ page }) => {
    test.skip(!process.env.PLAYWRIGHT_EMPLOYEE_EMAIL && !process.env.CI, 'Set PLAYWRIGHT_EMPLOYEE_EMAIL or run in CI with seeded users');
    await loginAs(page, 'employee');
    await page.goto('/app/admin/users');
    await expect(page).toHaveURL(/unauthorized|dashboard/);
  });

  test('admin can access dashboard', async ({ page }) => {
    test.skip(!process.env.PLAYWRIGHT_ADMIN_EMAIL && !process.env.CI, 'Set PLAYWRIGHT_ADMIN_EMAIL');
    await loginAs(page, 'admin');
    await page.goto('/app/dashboard');
    await expect(page).toHaveURL(/dashboard/);
  });
});

test.describe('Legacy EMS mode', () => {
  test.use({ extraHTTPHeaders: {} });

  test('app shell renders with default flags', async ({ page }) => {
    test.skip(!process.env.PLAYWRIGHT_ADMIN_EMAIL && !process.env.CI, 'Requires credentials');
    await loginAs(page, 'admin');
    await page.goto('/app/dashboard');
    await expect(page.locator('main, #main-app-content')).toBeVisible();
  });
});

test.describe('Route integrity', () => {
  test('unknown app route shows not found', async ({ page }) => {
    test.skip(!process.env.PLAYWRIGHT_ADMIN_EMAIL && !process.env.CI, 'Requires credentials');
    await loginAs(page, 'admin');
    await page.goto('/app/this-route-does-not-exist-xyz');
    await expect(page.getByText(/not found|404/i)).toBeVisible({ timeout: 10000 });
  });
});
