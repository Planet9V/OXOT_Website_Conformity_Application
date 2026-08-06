/**
 * Smoke test: AuthGate locks the conformity execution ("working") layer
 *
 * The backend already has a committed regression test proving logged-out users
 * get 401 from every conformity execution endpoint. This browser test guards
 * the *frontend* half of that contract — the AuthGate wrapper in App.tsx that
 * must show the "Admin sign in" card (never product/assessment data) on the
 * working-layer routes while leaving the public knowledge-base routes open.
 *
 * Without this, a future refactor could drop <AuthGate> from one of those
 * routes and silently render restricted data to anonymous visitors.
 *
 * Every API call is mocked so the test is self-contained (no API server / DB).
 * Crucially, the restricted endpoints are mocked to return clearly-labelled
 * SECRET_* data: even though the "server" would hand that data over, the gate
 * must prevent the child page from ever mounting and requesting/rendering it.
 */

import { test, expect, type Page } from '@playwright/test';

// ── Fixtures ─────────────────────────────────────────────────────────────────

/** A logged-out session — this is what makes the gate show the login card. */
const LOGGED_OUT_SESSION = { authenticated: false, username: null };

// Public knowledge-base payloads (minimal but valid shapes so the pages render).
const SUMMARY = {
  regulationCount: 1,
  requirementCount: 5,
  themeCount: 1,
  mappingCount: 1,
  regulations: [{ key: 'cra', name: 'Cyber Resilience Act', shortName: 'CRA', requirementCount: 5 }],
  keyDates: [{ date: '2027-12-11', label: 'CRA main obligations apply', regulationKey: 'cra' }],
};

const REGULATIONS = [
  {
    key: 'cra',
    shortName: 'CRA',
    fullTitle: 'Cyber Resilience Act',
    jurisdiction: 'EU',
    summary: 'Horizontal cybersecurity requirements for products with digital elements.',
    inForceDate: '2024-12-10',
    requirementCount: 5,
  },
];

const MAPPING_MATRIX = { regulations: REGULATIONS, themes: [], cells: [] };

// Restricted payloads — if any of these strings appear in the DOM, data leaked.
const SECRET_PRODUCT = 'SECRET_PRODUCT_ACME_GATEWAY';
const SECRET_PRODUCT_DETAIL = 'SECRET_PRODUCT_DETAIL_NAME';
const SECRET_ASSESSMENT = 'SECRET_ASSESSMENT_PRODUCT_NAME';

/**
 * Register the API mocks. Playwright matches routes LIFO, so the broad
 * catch-all is registered first (lowest priority) and specific mocks after.
 */
async function mockApi(page: Page) {
  const json = (body: unknown) => ({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });

  // Lowest priority: swallow any other /api/* calls.
  await page.route('**/api/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
  );

  // Session check — logged out.
  await page.route('**/api/admin/session', (route) => route.fulfill(json(LOGGED_OUT_SESSION)));

  // Public knowledge-base endpoints.
  await page.route('**/api/conformity/summary', (route) => route.fulfill(json(SUMMARY)));
  await page.route('**/api/conformity/regulations', (route) => route.fulfill(json(REGULATIONS)));
  await page.route('**/api/conformity/themes', (route) => route.fulfill(json([])));
  await page.route('**/api/conformity/requirements*', (route) => route.fulfill(json([])));
  await page.route('**/api/conformity/mappings', (route) => route.fulfill(json(MAPPING_MATRIX)));

  // Restricted endpoints — return secret data the gate must never surface.
  await page.route('**/api/conformity/products', (route) =>
    route.fulfill(
      json([
        {
          id: 1,
          name: SECRET_PRODUCT,
          productType: 'Hardware',
          version: '1.0',
          manufacturerName: 'Acme',
          intendedUse: '',
          description: '',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ]),
    ),
  );
  await page.route('**/api/conformity/products/*', (route) =>
    route.fulfill(
      json({
        product: {
          id: 1,
          name: SECRET_PRODUCT_DETAIL,
          productType: 'Hardware',
          version: '1.0',
          manufacturerName: 'Acme',
          intendedUse: '',
          description: '',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
        assessments: [],
      }),
    ),
  );
  await page.route('**/api/conformity/assessments/*', (route) =>
    route.fulfill(
      json({
        assessment: { id: 1, regulationKey: 'cra', stage: 'scoping' },
        product: { id: 1, name: SECRET_ASSESSMENT },
        counts: {},
      }),
    ),
  );
}

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

// ── Restricted routes must be gated ───────────────────────────────────────────

const GATED = [
  { path: '/conformity/products', secret: SECRET_PRODUCT },
  { path: '/conformity/products/1', secret: SECRET_PRODUCT_DETAIL },
  { path: '/conformity/assessments/1', secret: SECRET_ASSESSMENT },
];

for (const { path, secret } of GATED) {
  test(`logged-out visitor to ${path} sees the Admin sign in card, not data`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState('networkidle');

    // The gate's login card must render.
    await expect(page.getByText('Admin sign in')).toBeVisible();
    await expect(
      page.getByText('The conformity execution layer is restricted to administrators.'),
    ).toBeVisible();
    // The username/password form is the tell-tale of the gate, not the page.
    await expect(page.locator('#conformity-login')).toBeVisible();

    // The restricted data must NOT have leaked into the DOM.
    await expect(page.getByText(secret)).toHaveCount(0);
  });
}

// ── Public knowledge-base routes must stay open ───────────────────────────────

const PUBLIC = [
  { path: '/conformity/', heading: 'Portfolio Overview' },
  { path: '/conformity/regulations', heading: 'Regulations' },
  { path: '/conformity/requirements', heading: 'Requirements Explorer' },
  { path: '/conformity/mappings', heading: 'Cross-Regulation Matrix' },
];

for (const { path, heading } of PUBLIC) {
  test(`logged-out visitor to ${path} sees public content without login`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState('networkidle');

    // The page's own heading renders.
    await expect(page.getByRole('heading', { name: heading, level: 1 })).toBeVisible();

    // The login gate must NOT be present on public routes.
    await expect(page.getByText('Admin sign in')).toHaveCount(0);
    await expect(page.locator('#conformity-login')).toHaveCount(0);
  });
}
