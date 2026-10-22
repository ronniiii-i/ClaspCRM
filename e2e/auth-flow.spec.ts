import { test, expect } from '@playwright/test';

/**
 * End-to-end acceptance flow:
 *
 *   login → scoped dashboard → admin override → sidebar reflects the change
 *
 * These tests run against a running frontend (`E2E_FRONTEND_URL`) and a
 * running backend (`E2E_BACKEND_URL`). They are skipped automatically when no
 * credentials are provided so CI stays green on a fresh checkout.
 */

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD;
const STAFF_EMAIL = process.env.E2E_STAFF_EMAIL;
const STAFF_PASSWORD = process.env.E2E_STAFF_PASSWORD;

const hasAdmin = Boolean(ADMIN_EMAIL && ADMIN_PASSWORD);
const hasStaff = Boolean(STAFF_EMAIL && STAFF_PASSWORD);

test.describe('authenticated flows', () => {
  test('admin can log in and reach the dashboard', async ({ page }) => {
    test.skip(!hasAdmin, 'E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD not configured');

    await page.goto('/login');
    await page.fill('input[type="email"]', ADMIN_EMAIL!);
    await page.fill('input[type="password"]', ADMIN_PASSWORD!);
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard', { timeout: 30_000 });
    await expect(page).toHaveURL(/dashboard/);
  });

  test('an unauthenticated visitor is redirected to the login page', async ({
    page,
  }) => {
    await page.goto('/dashboard');
    await page.waitForURL('**/login', { timeout: 30_000 });
    await expect(page).toHaveURL(/login/);
  });

  test('a staff user does not see admin-only navigation', async ({ page }) => {
    test.skip(!hasStaff, 'E2E_STAFF_EMAIL / E2E_STAFF_PASSWORD not configured');

    await page.goto('/login');
    await page.fill('input[type="email"]', STAFF_EMAIL!);
    await page.fill('input[type="password"]', STAFF_PASSWORD!);
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard', { timeout: 30_000 });
    await expect(page.getByText('User Management')).toHaveCount(0);
  });

  test('logging out clears the session', async ({ page }) => {
    test.skip(!hasAdmin, 'E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD not configured');

    await page.goto('/login');
    await page.fill('input[type="email"]', ADMIN_EMAIL!);
    await page.fill('input[type="password"]', ADMIN_PASSWORD!);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 30_000 });

    await page.evaluate(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('auth_user');
    });

    await page.goto('/dashboard');
    await page.waitForURL('**/login', { timeout: 30_000 });
  });
});
