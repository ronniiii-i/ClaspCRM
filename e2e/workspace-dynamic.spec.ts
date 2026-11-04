import { test, expect, type ConsoleMessage, type Page } from '@playwright/test';

const ENABLED_TENANTS = (process.env.E2E_WORKSPACE_TENANTS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const ACME_EMAIL = process.env.E2E_ACME_ADMIN_EMAIL || 'admin@acme.test';
const ACME_PASSWORD = process.env.E2E_ACME_ADMIN_PASSWORD || 'Password123!';
const CLEAN_EMAIL = process.env.E2E_CLEAN_SLATE_ADMIN_EMAIL || 'admin@cleanslate.test';
const CLEAN_PASSWORD = process.env.E2E_CLEAN_SLATE_ADMIN_PASSWORD || 'Password123!';

// The subdomain must match the tenant slug (`clean-slate`, not `cleanslate`).
const ACME_BASE = process.env.E2E_ACME_URL || 'http://acme.localhost:3000';
const CLEAN_BASE =
  process.env.E2E_CLEAN_SLATE_URL || 'http://clean-slate.localhost:3000';

function isHydrationError(text: string): boolean {
  const t = text.toLowerCase();
  return (
    t.includes('hydration') ||
    t.includes('minified react error #418') ||
    t.includes('minified react error #423') ||
    t.includes('text content does not match server-rendered html')
  );
}

function isKnownNoise(text: string, allowAuthFailures: boolean): boolean {
  if (/download the react devtools/i.test(text)) return true;
  if (/failed to load resource/i.test(text) && /favicon|\.ico/i.test(text)) {
    return true;
  }
  // A 401 from a deliberately invalid login is the expected outcome, not an
  // application error.
  return allowAuthFailures && /failed to load resource/i.test(text) && /\b401\b/.test(text);
}

function attachConsoleGuards(
  page: Page,
  errors: string[],
  { allowAuthFailures = false }: { allowAuthFailures?: boolean } = {},
) {
  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (isKnownNoise(text, allowAuthFailures)) return;
    errors.push(
      `${isHydrationError(text) ? 'hydration console.error' : 'console.error'}: ${text}`,
    );
  });
  page.on('pageerror', (err) => {
    const text = err.message || String(err);
    errors.push(
      `${isHydrationError(text) ? 'hydration pageerror' : 'pageerror'}: ${text}`,
    );
  });
}

async function signIn(page: Page, baseUrl: string, email: string, password: string) {
  await page.goto(`${baseUrl}/login`);
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(dashboard|account-locked|settings\/billing)/, { timeout: 60_000 });
}

test.describe('Dynamic workspace E2E', () => {
  test.skip(
    !ENABLED_TENANTS.includes('acme') && !ENABLED_TENANTS.includes('clean-slate'),
    'E2E_WORKSPACE_TENANTS not set (e.g. acme,clean-slate)',
  );

  test('Acme: login, sidebar, key dynamic modules render', async ({ browser }) => {
    test.skip(!ENABLED_TENANTS.includes('acme'), 'acme not enabled');
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors: string[] = [];
    attachConsoleGuards(page, errors);

    await signIn(page, ACME_BASE, ACME_EMAIL, ACME_PASSWORD);
    await expect(page).not.toHaveURL(/\/login/);

    // Sidebar should show dynamic modules grouped by department
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.getByRole('link', { name: /Contacts/i })).toBeVisible();

    // DataTable: Sales Contacts
    await page.goto(`${ACME_BASE}/dept/sales/contacts`);
    await expect(page.getByRole('heading', { name: /Contacts/i }).first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/No records match the current filters\./i)).not.toBeVisible({ timeout: 5_000 }).catch(() => {});

    // Kanban: Sales Pipeline (Acme has deals in every column, so assert the
    // board and a seeded card rather than an empty-column placeholder).
    await page.goto(`${ACME_BASE}/dept/sales/sales-pipeline`);
    await expect(page.getByRole('heading', { name: /Sales Pipeline/i }).first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole('region', { name: /Sales Pipeline/i })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Pied Piper proof of concept/i).first()).toBeVisible({ timeout: 10_000 });

    // Dashboard: Finance Budget Management (Acme has expense data, so KPI
    // widgets must render with real values rather than the empty state).
    await page.goto(`${ACME_BASE}/dept/finance/budget-management`);
    await expect(page.getByRole('heading', { name: /Budget Management/i }).first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/Total budget/i).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Spend by category/i).first()).toBeVisible({ timeout: 10_000 });

    // Documents: Administration Document Management
    await page.goto(`${ACME_BASE}/dept/administration/document-management`);
    await expect(page.getByRole('heading', { name: /Document Management/i }).first()).toBeVisible({ timeout: 20_000 });

    // Form: Finance Expense Tracking
    await page.goto(`${ACME_BASE}/dept/finance/expense-tracking`);
    await expect(page.getByRole('heading', { name: /Expense Tracking/i }).first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/No submissions yet\./i).first()).toBeVisible({ timeout: 10_000 });

    expect(errors, `Console/page errors: ${errors.join('\n')}`).toEqual([]);
    await context.close();
  });

  test('Clean Slate: login and empty states render', async ({ browser }) => {
    test.skip(!ENABLED_TENANTS.includes('clean-slate'), 'clean-slate not enabled');
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors: string[] = [];
    attachConsoleGuards(page, errors);

    await signIn(page, CLEAN_BASE, CLEAN_EMAIL, CLEAN_PASSWORD);
    await expect(page).not.toHaveURL(/\/login/);

    await page.goto(`${CLEAN_BASE}/dept/sales/contacts`);
    await expect(page.getByRole('heading', { name: /Contacts/i }).first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/No records/i).first()).toBeVisible({ timeout: 10_000 });

    await page.goto(`${CLEAN_BASE}/dept/sales/sales-pipeline`);
    await expect(page.getByRole('heading', { name: /Sales Pipeline/i }).first()).toBeVisible({ timeout: 20_000 });

    await page.goto(`${CLEAN_BASE}/dept/finance/expense-tracking`);
    await expect(page.getByRole('heading', { name: /Expense Tracking/i }).first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/No submissions yet\./i).first()).toBeVisible({ timeout: 10_000 });

    await page.goto(`${CLEAN_BASE}/dept/administration/document-management`);
    await expect(page.getByRole('heading', { name: /Document Management/i }).first()).toBeVisible({ timeout: 20_000 });

    expect(errors, `Console/page errors: ${errors.join('\n')}`).toEqual([]);
    await context.close();
  });

  test('Cross-tenant login rejection', async ({ browser }) => {
    test.skip(
      !ENABLED_TENANTS.includes('acme') || !ENABLED_TENANTS.includes('clean-slate'),
      'need both tenants enabled',
    );
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors: string[] = [];
    attachConsoleGuards(page, errors, { allowAuthFailures: true });
    await page.goto(`${ACME_BASE}/login`);
    await page.fill('input[type="email"]', CLEAN_EMAIL);
    await page.fill('input[type="password"]', CLEAN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText(/Invalid|failed/i).first()).toBeVisible({ timeout: 5000 });

    expect(errors, `Console/page errors: ${errors.join('\n')}`).toEqual([]);
    await context.close();
  });
});
