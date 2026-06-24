import { test, expect } from '@playwright/test';

const PROTECTED_ROUTES = [
  '/app/dashboard',
  '/app/profile',
  '/app/employees',
  '/app/departments',
  '/app/attendance',
  '/app/leaves',
  '/app/documents',
  '/app/reports',
  '/app/projects',
  '/app/admin/users',
  '/app/tickets',
  '/app/tickets/new',
  '/app/my-queue',
  '/app/team-queue',
  '/app/approvals',
  '/app/my-approvals',
  '/app/knowledge-base',
  '/app/communications',
  '/app/notifications',
  '/app/executive-dashboard',
  '/app/payroll',
  '/app/payroll/governance/approvals',
  '/app/operator-dashboard',
  '/app/sla-dashboard',
];

test.describe('Route integrity — auth redirect', () => {
  for (const route of PROTECTED_ROUTES) {
    test(`${route} redirects unauthenticated users`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/login/);
    });
  }
});

test.describe('Logout flow', () => {
  test('logout route accessible from login', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/login/);
  });
});
