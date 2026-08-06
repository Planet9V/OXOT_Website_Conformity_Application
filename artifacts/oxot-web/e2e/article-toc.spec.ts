/**
 * Smoke test: Article TOC sidebar reflects CMS-edited headings
 *
 * The TOC sidebar in the ArticleSection component is parsed dynamically from
 * the article markdown returned by the page API (`/api/site/:locale/pages/:slug`).
 * When an admin edits a service page in the CMS and publishes, the API returns
 * the new markdown and the TOC must update automatically.
 *
 * Existing tests only exercise the seeded content. These tests mock the page
 * endpoint with *edited* markdown to guard the end-to-end contract:
 *   – a renamed / added H2 heading appears in the TOC with a working anchor
 *   – the scroll-spy anchor link scrolls to the matching heading id
 *   – removing all H2 headings hides the TOC and drops the two-column layout
 *
 * All API calls are mocked so the test is self-contained (no API server / DB).
 */

import { test, expect, type Page } from '@playwright/test';

// ── Fixtures ─────────────────────────────────────────────────────────────────

const SITE_SETTINGS = {
  siteName: 'OXOT',
  tagline: '',
  footerText: '',
  logoUrl: null,
  primaryColor: null,
  accentColor: null,
};

const NAV_ITEMS = [
  { id: 1, label: 'Services', href: '/services', placement: 'header', order: 1, external: false },
];

const SLUG = 'ot-security-baseline';

/** Long filler so headings sit far enough apart for a real scroll. */
const FILLER = Array.from({ length: 12 }, (_, i) => `Body paragraph ${i + 1} for spacing.`).join(
  '\n\n',
);

/** Build a published-page API payload with a single article section. */
function pageWithMarkdown(markdown: string) {
  return {
    id: 101,
    slug: SLUG,
    title: 'OT Security Baseline',
    locale: 'en',
    seoTitle: null,
    seoDescription: null,
    ogTitle: null,
    ogDescription: null,
    ogImage: null,
    canonicalUrl: null,
    metaKeywords: null,
    noindex: false,
    sections: [
      {
        id: 1,
        type: 'article',
        order: 0,
        data: { title: 'OT Security Baseline', excerpt: 'Intro lead paragraph.', markdown },
      },
    ],
  };
}

/**
 * Register the API mocks. Playwright matches routes LIFO, so the broad
 * catch-all is registered first (lowest priority) and specific mocks after.
 */
async function mockApi(page: Page, markdown: string) {
  await page.route('**/api/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
  );
  await page.route('**/api/site/*/settings', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(SITE_SETTINGS) }),
  );
  await page.route('**/api/site/*/navigation', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(NAV_ITEMS) }),
  );
  await page.route('**/api/site/*/pages/*', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(pageWithMarkdown(markdown)),
    }),
  );
}

// ── Tests ────────────────────────────────────────────────────────────────────

test('TOC reflects a renamed/added H2 heading from edited CMS markdown', async ({ page }) => {
  // Simulates the admin renaming "What you get" → "What you receive" and adding
  // a brand-new "Rollout timeline" heading, then publishing.
  const markdown = [
    '## Why a baseline matters',
    FILLER,
    '## What you receive',
    FILLER,
    '## Rollout timeline',
    FILLER,
    '## How it connects',
    FILLER,
  ].join('\n\n');

  await mockApi(page, markdown);
  await page.goto(`/${SLUG}`);
  await page.waitForLoadState('networkidle');

  // The TOC sidebar lives in an <aside> labelled "On this page".
  const toc = page.locator('aside');
  await expect(toc.getByText('On this page')).toBeVisible();

  // The edited/added heading labels must appear as TOC links.
  await expect(toc.getByRole('link', { name: 'What you receive' })).toBeVisible();
  await expect(toc.getByRole('link', { name: 'Rollout timeline' })).toBeVisible();

  // The old label must NOT linger (proves the TOC is parsed live, not cached).
  await expect(toc.getByRole('link', { name: 'What you get' })).toHaveCount(0);
});

test('TOC anchor link scrolls to the matching heading id', async ({ page }) => {
  const markdown = [
    '## Why a baseline matters',
    FILLER,
    '## What you receive',
    FILLER,
    '## Rollout timeline',
    FILLER,
    '## How it connects',
    FILLER,
  ].join('\n\n');

  await mockApi(page, markdown);
  await page.goto(`/${SLUG}`);
  await page.waitForLoadState('networkidle');

  // The anchor href must match the slugified heading id, and a heading with that
  // id must exist in the article — that wiring is what the scroll-spy relies on.
  const link = page.locator('aside').getByRole('link', { name: 'Rollout timeline' });
  await expect(link).toHaveAttribute('href', '#rollout-timeline');

  const heading = page.locator('h2#rollout-timeline');
  await expect(heading).toHaveText('Rollout timeline');

  // Clicking the anchor scrolls the heading up near the top of the viewport
  // (the heading uses scroll-mt-24 ≈ 96px offset).
  await link.click();
  await expect
    .poll(async () => (await heading.boundingBox())?.y ?? Infinity, { timeout: 5000 })
    .toBeLessThan(200);
});

test('removing all H2 headings hides the TOC and drops the two-column layout', async ({ page }) => {
  // Admin strips every H2 heading from the page body.
  const markdown = ['Just an intro paragraph.', FILLER].join('\n\n');

  await mockApi(page, markdown);
  await page.goto(`/${SLUG}`);
  await page.waitForLoadState('networkidle');

  // Article body still renders.
  await expect(page.getByRole('heading', { level: 1, name: 'OT Security Baseline' })).toBeVisible();

  // No TOC sidebar and no "On this page" label.
  await expect(page.getByText('On this page')).toHaveCount(0);
  await expect(page.locator('aside')).toHaveCount(0);

  // Single-column layout: the article is centered with max-w-3xl, not flex-1.
  await expect(page.locator('article.mx-auto.max-w-3xl')).toBeVisible();
});

test('TOC stays hidden when fewer than three H2 headings are published', async ({ page }) => {
  // The sidebar only appears once there are 3+ headings; two must not trigger it.
  const markdown = ['## First heading', FILLER, '## Second heading', FILLER].join('\n\n');

  await mockApi(page, markdown);
  await page.goto(`/${SLUG}`);
  await page.waitForLoadState('networkidle');

  await expect(page.getByRole('heading', { level: 2, name: 'First heading' })).toBeVisible();
  await expect(page.getByText('On this page')).toHaveCount(0);
  await expect(page.locator('article.mx-auto.max-w-3xl')).toBeVisible();
});
