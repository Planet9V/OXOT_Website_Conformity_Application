/**
 * Demo front-door + Conformity Copilot regression test.
 *
 * The demo experience is the product's shop window, so its promises must hold:
 *   - the public launch pages (/welcome, /demo) render full-bleed with the demo
 *     credentials pre-filled — a visitor can enter with one click;
 *   - the authed landing (/overview) routes straight into the seeded worked
 *     assessment via a single "Open workbench" CTA;
 *   - the docked Copilot streams a grounded reply (SSE) into the panel, and when
 *     the endpoint refuses (rate-limit / outage) it shows an honest error card
 *     instead of a silent dead panel or a fabricated answer.
 *
 * The assistant endpoint is mocked with a canned SSE body, so the test exercises
 * the real fetch + ReadableStream parsing path without the LLM (fast + stable).
 * Every other API call is mocked too — no API server / DB required.
 */

import { test, expect, type Page } from '@playwright/test';

const json = (body: unknown) => ({
  status: 200,
  contentType: 'application/json',
  body: JSON.stringify(body),
});

const DEMO_SESSION = { authenticated: true, username: 'oxotdemo', role: 'demo' };
const ANON_SESSION = { authenticated: false };

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

// A canned SSE stream: two content deltas then a terminating {done:true},
// framed exactly as the server emits (frames separated by a blank line).
const SSE_REPLY = [
  'data: {"content":"Fix the buffer overflow"}',
  'data: {"content":" in the pairing flow first."}',
  'data: {"done":true}',
  '',
].join('\n\n');

async function baseMocks(page: Page, session: unknown) {
  // Lowest priority catch-all (Playwright matches LIFO).
  await page.route('**/api/**', (route) => route.fulfill(json([])));
  await page.route('**/api/admin/session', (route) => route.fulfill(json(session)));
}

// ── Public front door ─────────────────────────────────────────────────────────

test.describe('demo front door', () => {
  test('welcome page leads with the pitch and launches the demo', async ({ page }) => {
    await baseMocks(page, ANON_SESSION);
    await page.goto('/conformity/welcome');

    await expect(page.getByRole('heading', { name: /Fly your product/i })).toBeVisible();
    // The primary CTA takes a visitor straight to the demo login.
    await page.getByRole('link', { name: /Launch the live demo/i }).click();
    await page.waitForURL(/\/conformity\/demo$/);
  });

  test('demo page pre-fills the shared credentials', async ({ page }) => {
    await baseMocks(page, ANON_SESSION);
    await page.goto('/conformity/demo');

    // Username is pre-filled so entry is one click; the submit CTA is present.
    await expect(page.getByLabel('Username')).toHaveValue('oxotdemo');
    await expect(page.getByRole('button', { name: /Enter demo/i })).toBeVisible();
  });
});

// ── Authed landing ────────────────────────────────────────────────────────────

test('overview routes into the seeded worked assessment', async ({ page }) => {
  await baseMocks(page, DEMO_SESSION);
  await page.route('**/api/conformity/products', (route) => route.fulfill(json([PRODUCT])));
  await page.route('**/api/conformity/products/1', (route) =>
    route.fulfill(json({ product: PRODUCT, assessments: [ASSESSMENT] })),
  );

  await page.goto('/conformity/overview');
  await page.waitForLoadState('networkidle');

  await expect(page.getByRole('heading', { name: 'NovaGuard Smart Home Hub' })).toBeVisible();
  // Demo role is surfaced, and the primary CTA deep-links to the workbench.
  await expect(page.getByText('Demo workspace')).toBeVisible();
  const cta = page.getByTestId('open-workbench');
  await expect(cta).toBeVisible();
  await expect(page.getByRole('link', { name: /Open workbench/i })).toHaveAttribute(
    'href',
    /\/assessments\/8$/,
  );
});

// ── Conformity Copilot dock ───────────────────────────────────────────────────

test.describe('conformity copilot dock', () => {
  async function gotoWorkbench(page: Page) {
    await page.route('**/api/conformity/assessments/8', (route) =>
      route.fulfill(json(ASSESSMENT_DETAIL)),
    );
    await page.goto('/conformity/assessments/8');
    await page.waitForLoadState('networkidle');
    // The dock only mounts once the assessment detail has loaded.
    await expect(page.getByTestId('assistant-open')).toBeVisible();
  }

  test('streams a grounded reply into the panel', async ({ page }) => {
    await baseMocks(page, DEMO_SESSION);
    let captured: { message?: string; history?: unknown[] } | null = null;
    await page.route('**/api/conformity/assessments/8/assistant', async (route) => {
      captured = route.request().postDataJSON();
      await route.fulfill({ status: 200, contentType: 'text/event-stream', body: SSE_REPLY });
    });

    await gotoWorkbench(page);

    await page.getByTestId('assistant-open').click();
    await expect(page.getByRole('dialog', { name: 'Conformity Copilot' })).toBeVisible();
    // Panel advertises that it is scoped to this product.
    await expect(page.getByText('Scoped to NovaGuard Smart Home Hub')).toBeVisible();

    // Fire a suggestion chip and assert the streamed answer renders in full.
    await page.getByRole('button', { name: 'What should I fix first?' }).click();
    await expect(
      page.getByText(/Fix the buffer overflow in the pairing flow first\./),
    ).toBeVisible();

    // The request carried the message and an empty history on first turn.
    expect(captured?.message).toBe('What should I fix first?');
    expect(captured?.history).toEqual([]);
  });

  test('shows an honest error card when the assistant refuses', async ({ page }) => {
    await baseMocks(page, DEMO_SESSION);
    await page.route('**/api/conformity/assessments/8/assistant', (route) =>
      route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Slow down — try again in a moment.' }),
      }),
    );

    await gotoWorkbench(page);
    await page.getByTestId('assistant-open').click();
    await page.getByRole('button', { name: 'Summarise my readiness' }).click();

    await expect(page.getByText('Slow down — try again in a moment.')).toBeVisible();
    // No fabricated answer bubble is left behind.
    await expect(page.getByText(/Fix the buffer overflow/)).toHaveCount(0);
  });
});
