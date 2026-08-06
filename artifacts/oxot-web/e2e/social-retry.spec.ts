/**
 * Browser-level test: Retry a failed social post from the Recent posts log
 * (Admin → Newsletter → Social tab).
 *
 * The retry endpoint's behaviour (auth contract, appending a "retry" outcome
 * row) is covered server-side; this spec verifies the browser wiring — that a
 * failed log entry shows a Retry button, that clicking it POSTs to the retry
 * endpoint, and that the log refreshes with the new outcome and toast.
 *
 * All API calls are mocked (established gated-page pattern: mock
 * /api/admin/session as an authenticated admin), so the spec is fully
 * self-contained and does not need the API server running.
 */

import { test, expect } from '@playwright/test';

const SESSION = { authenticated: true, username: 'admin', role: 'admin' };

const FAILED_POST = {
  id: 1,
  platform: 'linkedin',
  success: false,
  error: 'LinkedIn API 401: INVALID_ACCESS_TOKEN',
  text: 'New article: CRA obligations for manufacturers',
  source: 'publish',
  createdAt: '2026-07-20T10:00:00.000Z',
};

const SUCCESS_POST = {
  id: 2,
  platform: 'x',
  success: true,
  error: null,
  text: 'New article: CRA obligations for manufacturers',
  source: 'publish',
  createdAt: '2026-07-20T10:00:01.000Z',
};

const RETRY_OUTCOME = {
  id: 3,
  platform: 'linkedin',
  success: true,
  error: null,
  text: 'New article: CRA obligations for manufacturers',
  source: 'retry',
  createdAt: '2026-07-21T09:00:00.000Z',
};

test.beforeEach(async ({ page }) => {
  // Pre-accept cookie consent so the banner dialog never intercepts clicks.
  await page.addInitScript(() => {
    localStorage.setItem('oxot-cookie-consent', 'declined');
  });

  // Lowest priority: swallow any other /api/* calls (nav, newsletters, …).
  // Playwright matches routes LIFO, so specific mocks below win.
  await page.route('**/api/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
  );

  await page.route('**/api/site/*/settings', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        siteName: 'OXOT',
        tagline: '',
        footerText: '',
        logoUrl: null,
        primaryColor: null,
        accentColor: null,
      }),
    }),
  );

  await page.route('**/api/admin/session', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(SESSION),
    }),
  );

  await page.route('**/api/admin/social/status*', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ linkedin: { configured: true }, x: { configured: true } }),
    }),
  );
});

test('failed log entry shows Retry; clicking it posts to the retry endpoint and refreshes the log', async ({
  page,
}) => {
  let retriedId: string | null = null;
  let postsServed = 0;

  await page.route('**/api/admin/social/posts', (route) => {
    postsServed += 1;
    // Before the retry: one failure + one success. After: retry row on top.
    const body = retriedId
      ? [RETRY_OUTCOME, SUCCESS_POST, FAILED_POST]
      : [SUCCESS_POST, FAILED_POST];
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });

  await page.route('**/api/admin/social/posts/*/retry', (route) => {
    expect(route.request().method()).toBe('POST');
    retriedId = route.request().url().match(/posts\/(\d+)\/retry/)?.[1] ?? null;
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(RETRY_OUTCOME),
    });
  });

  await page.goto('/admin/newsletter');
  await page.getByRole('tab', { name: /social/i }).click();

  await expect(page.getByRole('heading', { name: 'Recent posts' })).toBeVisible();

  // The failed entry surfaces its error and a Retry button; the successful
  // entry has none.
  await expect(page.getByText('LinkedIn API 401: INVALID_ACCESS_TOKEN')).toBeVisible();
  const retryButtons = page.getByRole('button', { name: 'Retry', exact: true });
  await expect(retryButtons).toHaveCount(1);

  await retryButtons.click();

  // The retry hit the failed row's endpoint…
  await expect.poll(() => retriedId).toBe(String(FAILED_POST.id));
  // …the log refetched and now shows the appended "retry" outcome row…
  await expect.poll(() => postsServed).toBeGreaterThan(1);
  await expect(page.getByText('retry', { exact: true })).toBeVisible();
  // …and the toast reflects the outcome immediately.
  // Toast titles render twice (visible toast + aria-live announcement).
  await expect(page.getByText('Retry succeeded').first()).toBeVisible();
});

test('successful-only log shows no Retry button', async ({ page }) => {
  await page.route('**/api/admin/social/posts', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([SUCCESS_POST]),
    }),
  );

  await page.goto('/admin/newsletter');
  await page.getByRole('tab', { name: /social/i }).click();

  await expect(page.getByRole('heading', { name: 'Recent posts' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retry', exact: true })).toHaveCount(0);
});
