/**
 * Smoke test: Services dropdown — Conformity Platform section
 *
 * Guards against regressions that static unit tests cannot catch:
 *   – swapping the dropdown / navigation-menu library
 *   – restructuring the Header component so the PANELS data no longer reaches
 *     the rendered DOM
 *   – wiring navigation items from the API in a way that skips the Services panel
 *
 * The test mocks all API calls so it is fully self-contained and does not
 * require the API server to be running.
 */

import { test, expect } from '@playwright/test';

// ── Mock data ────────────────────────────────────────────────────────────────

/** Minimal nav item that causes the Services dropdown panel to render */
const NAV_ITEMS = [
  {
    id: 1,
    label: 'Services',
    href: '/services',
    placement: 'header',
    order: 1,
    external: false,
  },
];

const SITE_SETTINGS = {
  siteName: 'OXOT',
  tagline: '',
  footerText: '',
  logoUrl: null,
  primaryColor: null,
  accentColor: null,
};

// ── Intercept API calls before every test ────────────────────────────────────
//
// Playwright matches routes in LIFO order (last-registered = highest priority).
// Register the broad catch-all FIRST so it has the lowest priority, then
// register the specific mocks — they will win over the catch-all.

test.beforeEach(async ({ page }) => {
  // Lowest priority: swallow any other /api/* calls (pages, assistant, etc.)
  await page.route('**/api/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
  );

  // Site settings — higher priority than catch-all
  await page.route('**/api/site/*/settings', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(SITE_SETTINGS),
    }),
  );

  // Navigation endpoint — highest priority: must be registered last
  await page.route('**/api/site/*/navigation', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(NAV_ITEMS),
    }),
  );
});

// ── Tests ────────────────────────────────────────────────────────────────────

test('Services dropdown renders the Conformity Platform section label', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Open the Services mega-menu
  const trigger = page.getByRole('button', { name: /services/i });
  await trigger.click();

  // Section heading
  await expect(page.getByText('Conformity Platform')).toBeVisible();
});

test('Services dropdown shows all four Conformity Platform links', async ({ page }) => {
  await page.goto('/');

  const trigger = page.getByRole('button', { name: /services/i });
  await trigger.click();

  // All four items must be visible and be real links (not section labels)
  const portfolioLink = page.getByRole('link', { name: 'Portfolio Overview' });
  const regulationsLink = page.getByRole('link', { name: 'Regulations' });
  const requirementsLink = page.getByRole('link', { name: 'Requirements Explorer' });
  const matrixLink = page.getByRole('link', { name: 'Cross-Regulation Matrix' });

  await expect(portfolioLink).toBeVisible();
  await expect(regulationsLink).toBeVisible();
  await expect(requirementsLink).toBeVisible();
  await expect(matrixLink).toBeVisible();
});

test('Conformity Platform links point to the correct hrefs', async ({ page }) => {
  await page.goto('/');

  const trigger = page.getByRole('button', { name: /services/i });
  await trigger.click();

  // Verify hrefs so a library swap that renders plain <span> instead of <a>
  // would be caught even if the text is visible.
  await expect(page.getByRole('link', { name: 'Portfolio Overview' })).toHaveAttribute(
    'href',
    /\/conformity-platform$/,
  );
  await expect(page.getByRole('link', { name: 'Regulations' })).toHaveAttribute(
    'href',
    /\/conformity-platform\/regulations$/,
  );
  await expect(page.getByRole('link', { name: 'Requirements Explorer' })).toHaveAttribute(
    'href',
    /\/conformity-platform\/requirements$/,
  );
  await expect(page.getByRole('link', { name: 'Cross-Regulation Matrix' })).toHaveAttribute(
    'href',
    /\/conformity-platform\/matrix$/,
  );
});
