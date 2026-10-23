import { test, expect, type Page } from '@playwright/test';

/**
 * Department-scoped dashboards.
 *
 * The same `GET /dashboard/widgets` endpoint serves every HOD, but the payload
 * must be narrowed to the caller's department: a Finance HOD gets budget and
 * tax widgets, an IT HOD must never receive them.
 *
 * Credentials are supplied through the environment so CI stays green on a
 * fresh checkout (tests skip when the accounts are not configured).
 */

const FINANCE_EMAIL = process.env.E2E_FINANCE_HOD_EMAIL;
const FINANCE_PASSWORD = process.env.E2E_FINANCE_HOD_PASSWORD;
const IT_EMAIL = process.env.E2E_IT_HOD_EMAIL;
const IT_PASSWORD = process.env.E2E_IT_HOD_PASSWORD;

const hasFinance = Boolean(FINANCE_EMAIL && FINANCE_PASSWORD);
const hasIt = Boolean(IT_EMAIL && IT_PASSWORD);

async function signIn(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 45_000 });
}

test.describe('department-scoped dashboards', () => {
  test('a Finance HOD sees the finance widgets', async ({ page }) => {
    test.skip(!hasFinance, 'E2E_FINANCE_HOD_* not configured');

    await signIn(page, FINANCE_EMAIL!, FINANCE_PASSWORD!);

    await expect(
      page.getByRole('heading', { name: 'Finance Dashboard' }),
    ).toBeVisible({ timeout: 45_000 });
    await expect(page.getByText('Budget Variance')).toBeVisible();
    await expect(page.getByText('System Health')).toHaveCount(0);
  });

  test('an IT HOD sees the IT widgets and no budget data', async ({ page }) => {
    test.skip(!hasIt, 'E2E_IT_HOD_* not configured');

    await signIn(page, IT_EMAIL!, IT_PASSWORD!);

    await expect(
      page.getByRole('heading', { name: 'IT Dashboard' }),
    ).toBeVisible({ timeout: 45_000 });
    await expect(page.getByText('System Health')).toBeVisible();
    await expect(page.getByText('Budget Variance')).toHaveCount(0);
  });
});
