/**
 * Positive-path counterpart to auth-gate.spec.ts.
 *
 * That spec proves logged-out visitors are blocked from the execution layer.
 * This one proves the gate actually OPENS: with an authenticated admin
 * session, /products, /products/:id and /assessments/:id must render their
 * real data — never the "Admin sign in" card. A regression in the session
 * shape or the gate's query wiring would otherwise lock admins out with no
 * test catching it.
 *
 * It also exercises the login submit path: starting logged out, filling the
 * form and submitting (with a mocked successful /api/admin/login) must flip
 * the gate to the child page without a reload.
 *
 * Every API call is mocked so the test is self-contained (no API server/DB).
 */

import { test, expect, type Page } from '@playwright/test';

const json = (body: unknown) => ({
  status: 200,
  contentType: 'application/json',
  body: JSON.stringify(body),
});

const ADMIN_SESSION = { authenticated: true, username: 'oxotadmin', role: 'admin' };
const LOGGED_OUT_SESSION = { authenticated: false, username: null };

// ── Fixtures (shapes match the generated API schemas) ────────────────────────

const PRODUCT = {
  id: 1,
  name: 'NovaGuard Smart Home Hub',
  description: 'Connected home hub',
  manufacturerName: 'NovaGuard Labs',
  manufacturerAddress: '',
  authorizedRep: '',
  productType: 'Hardware',
  version: '2.0',
  intendedUse: '',
  supportPeriodStart: null,
  supportPeriodEnd: null,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

const ASSESSMENT = {
  id: 8,
  productId: 1,
  regulationKey: 'cra',
  status: 'active',
  currentStage: 'gap_assessment',
  scopeResult: 'in_scope',
  classKey: 'default',
  routeKey: null,
  startedAt: '2025-01-01T00:00:00Z',
  completedAt: null,
  updatedAt: '2025-01-01T00:00:00Z',
};

const ASSESSMENT_DETAIL = {
  assessment: ASSESSMENT,
  product: PRODUCT,
  answers: [],
  scope: { result: 'in_scope', reasons: [], answered: true },
  classification: {},
  allowedRoutes: [],
  recommendedRouteKey: null,
  className: null,
  routeName: null,
  counts: {
    evaluationsTotal: 19,
    evaluationsMet: 10,
    evaluationsNotMet: 1,
    evidenceCount: 3,
    openIncidents: 1,
  },
};

/**
 * Data mocks shared by all tests. Playwright matches routes LIFO, so the
 * catch-all goes first (lowest priority) and specific mocks after. The
 * session mock is registered separately per test (authed vs. login flow).
 */
async function mockData(page: Page) {
  // Lowest priority: list endpoints not under test can safely return [].
  await page.route('**/api/**', (route) => route.fulfill(json([])));

  await page.route('**/api/conformity/products', (route) => route.fulfill(json([PRODUCT])));
  await page.route('**/api/conformity/products/1', (route) =>
    route.fulfill(json({ product: PRODUCT, assessments: [ASSESSMENT] })),
  );
  await page.route('**/api/conformity/assessments/8', (route) =>
    route.fulfill(json(ASSESSMENT_DETAIL)),
  );
}

// ── Authenticated admins reach the working layer ─────────────────────────────

test.describe('authenticated admin passes the gate', () => {
  test.beforeEach(async ({ page }) => {
    await mockData(page);
    await page.route('**/api/admin/session', (route) => route.fulfill(json(ADMIN_SESSION)));
  });

  test('/conformity/products renders the product list, not the login card', async ({ page }) => {
    await page.goto('/conformity/products');

    await expect(page.getByRole('heading', { name: 'Products', level: 1 })).toBeVisible();
    await expect(page.getByText(PRODUCT.name)).toBeVisible();
    await expect(page.getByText('NovaGuard Labs')).toBeVisible();

    await expect(page.getByText('Admin sign in')).toHaveCount(0);
    await expect(page.locator('#conformity-login')).toHaveCount(0);
  });

  test('/conformity/products/1 renders the product detail, not the login card', async ({
    page,
  }) => {
    await page.goto('/conformity/products/1');

    // Product name renders as the detail card title.
    await expect(page.getByText(PRODUCT.name).first()).toBeVisible();
    // Its assessment list renders too (proves the detail payload was consumed).
    await expect(page.getByText(/CRA/i).first()).toBeVisible();

    await expect(page.getByText('Admin sign in')).toHaveCount(0);
    await expect(page.locator('#conformity-login')).toHaveCount(0);
  });

  test('/conformity/assessments/8 renders the workbench, not the login card', async ({ page }) => {
    await page.goto('/conformity/assessments/8');

    // Assessment header shows the product it belongs to — the load succeeded.
    await expect(page.getByText(PRODUCT.name).first()).toBeVisible();
    // And the workbench did not fall into its error state.
    await expect(page.getByText('Assessment not found or failed to load.')).toHaveCount(0);

    await expect(page.getByText('Admin sign in')).toHaveCount(0);
    await expect(page.locator('#conformity-login')).toHaveCount(0);
  });
});

// ── Login form submit flips the gate ─────────────────────────────────────────

test('submitting valid credentials flips the gate to the products page', async ({ page }) => {
  await mockData(page);

  // Stateful session: logged out until a successful login is observed.
  let loggedIn = false;
  await page.route('**/api/admin/session', (route) =>
    route.fulfill(json(loggedIn ? ADMIN_SESSION : LOGGED_OUT_SESSION)),
  );
  await page.route('**/api/admin/login', (route) => {
    loggedIn = true;
    route.fulfill(json({ success: true, username: 'oxotadmin' }));
  });

  await page.goto('/conformity/products');

  // Gate is closed: login card shows, no data.
  await expect(page.getByText('Admin sign in')).toBeVisible();
  await expect(page.getByText(PRODUCT.name)).toHaveCount(0);

  await page.getByLabel('Username').fill('oxotadmin');
  await page.getByLabel('Password').fill('correct-password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Gate opens in place — the products page renders without a reload.
  await expect(page.getByRole('heading', { name: 'Products', level: 1 })).toBeVisible();
  await expect(page.getByText(PRODUCT.name)).toBeVisible();
  await expect(page.locator('#conformity-login')).toHaveCount(0);
});
