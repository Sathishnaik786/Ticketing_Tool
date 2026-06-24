import { test as base, expect } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.goto('/login');
    await use(page);
  },
});

export { expect };

export async function loginAs(page: import('@playwright/test').Page, role: 'admin' | 'employee' | 'manager' | 'hr') {
  const creds: Record<string, { email: string; password: string }> = {
    admin: { email: process.env.PLAYWRIGHT_ADMIN_EMAIL ?? 'admin@ticketra.com', password: process.env.PLAYWRIGHT_ADMIN_PASSWORD ?? 'admin123' },
    employee: { email: process.env.PLAYWRIGHT_EMPLOYEE_EMAIL ?? 'employee@ticketra.com', password: process.env.PLAYWRIGHT_EMPLOYEE_PASSWORD ?? 'employee123' },
    manager: { email: process.env.PLAYWRIGHT_MANAGER_EMAIL ?? 'manager@ticketra.com', password: process.env.PLAYWRIGHT_MANAGER_PASSWORD ?? 'manager123' },
    hr: { email: process.env.PLAYWRIGHT_HR_EMAIL ?? 'hr@ticketra.com', password: process.env.PLAYWRIGHT_HR_PASSWORD ?? 'hr123' },
  };
  const { email, password } = creds[role];
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /sign in|login/i }).click();
  await page.waitForURL(/\/app/, { timeout: 15000 });
}
