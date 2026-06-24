import { test, expect } from '@playwright/test';

test.describe('GlobalSearch — unauthenticated', () => {
  test('login page has no global search', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('searchbox')).toHaveCount(0);
  });
});

test.describe('CommandPalette — unauthenticated', () => {
  test('cmd+k on login does not crash', async ({ page }) => {
    await page.goto('/login');
    await page.keyboard.press('Meta+k');
    await page.keyboard.press('Control+k');
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Ticket routes — auth gate', () => {
  test('tickets list requires login', async ({ page }) => {
    await page.goto('/app/tickets');
    await expect(page).toHaveURL(/login/);
  });

  test('create ticket requires login', async ({ page }) => {
    await page.goto('/app/tickets/new');
    await expect(page).toHaveURL(/login/);
  });
});

test.describe('Notifications — auth gate', () => {
  test('notifications center requires login', async ({ page }) => {
    await page.goto('/app/notifications');
    await expect(page).toHaveURL(/login/);
  });
});

test.describe('Knowledge — auth gate', () => {
  test('knowledge base requires login', async ({ page }) => {
    await page.goto('/app/knowledge-base');
    await expect(page).toHaveURL(/login/);
  });
});

test.describe('Analytics — auth gate', () => {
  test('executive dashboard requires login', async ({ page }) => {
    await page.goto('/app/executive-dashboard');
    await expect(page).toHaveURL(/login/);
  });
});

test.describe('Payroll — auth gate', () => {
  test('payroll module requires login', async ({ page }) => {
    await page.goto('/app/payroll');
    await expect(page).toHaveURL(/login/);
  });

  test('payroll governance approvals requires login', async ({ page }) => {
    await page.goto('/app/payroll/governance/approvals');
    await expect(page).toHaveURL(/login/);
  });
});

test.describe('Approvals — auth gate', () => {
  test('my approvals requires login', async ({ page }) => {
    await page.goto('/app/my-approvals');
    await expect(page).toHaveURL(/login/);
  });
});

test.describe('Assignments — auth gate', () => {
  test('my queue requires login', async ({ page }) => {
    await page.goto('/app/my-queue');
    await expect(page).toHaveURL(/login/);
  });
});
