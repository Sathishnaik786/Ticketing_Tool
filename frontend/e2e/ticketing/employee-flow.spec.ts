import { test, expect } from '@playwright/test';

/**
 * ETMS Employee Flow E2E
 * Run with: VITE_ENABLE_TICKETING=true ENABLE_TICKETING=true
 * Requires: PLAYWRIGHT_TEST_EMAIL / PLAYWRIGHT_TEST_PASSWORD env vars
 */

const employeeEmail = process.env.PLAYWRIGHT_TEST_EMAIL;
const employeePassword = process.env.PLAYWRIGHT_TEST_PASSWORD;

test.describe('Employee ticket lifecycle', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!employeeEmail || !employeePassword, 'Set PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD');
    test.skip(process.env.VITE_ENABLE_TICKETING !== 'true', 'Requires ticketing enabled');

    await page.goto('/login');
    await page.getByLabel(/email/i).fill(employeeEmail!);
    await page.getByLabel(/password/i).fill(employeePassword!);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await page.waitForURL(/\/app/);
  });

  test('create ticket form validates required fields', async ({ page }) => {
    await page.goto('/app/tickets/new');
    await expect(page.getByRole('heading', { name: /create ticket/i })).toBeVisible();
    await page.getByRole('button', { name: /create ticket/i }).click();
    await expect(page.getByRole('alert').first()).toBeVisible();
  });

  test('ticket list page renders', async ({ page }) => {
    await page.goto('/app/tickets');
    await expect(page.getByRole('heading', { name: /^tickets$/i })).toBeVisible();
  });
});
