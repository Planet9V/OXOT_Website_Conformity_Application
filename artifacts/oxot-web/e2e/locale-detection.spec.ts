/**
 * Smoke test: bare-root locale detection for first-time visitors
 *
 * The LocaleProvider's initial-mount effect redirects a FIRST-TIME visitor who
 * opens the bare root "/" to "/nl" when their browser prefers Dutch
 * (navigator.languages), while:
 *   – a stored preference always wins over browser detection, and
 *   – an explicit locale in the URL (a "/nl/..." deep link) is never touched.
 *
 * The pure helper (`preferredLocaleFromLanguages`) is unit-tested, but a
 * regression in the provider effect wiring would silently drop the behavior
 * without failing any unit test. This spec drives real fresh browser contexts
 * (Playwright's `locale` option sets Accept-Language AND navigator.languages)
 * through the bare root and asserts the landing URL end to end.
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

/** Minimal home page payload so the SPA renders something real at "/" and "/nl". */
function homePagePayload(locale: 'en' | 'nl') {
  const title = locale === 'nl' ? 'Startpagina' : 'Home';
  return {
    id: 1,
    slug: 'home',
    title,
    locale,
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
        data: { title, excerpt: 'Intro.', markdown: `## ${title}\n\nWelcome.` },
      },
    ],
  };
}

/**
 * Register API mocks (LIFO matching: broad catch-all first, specific after) so
 * the SPA boots cleanly in any locale without a backend.
 */
async function mockApi(page: Page) {
  await page.route('**/api/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
  );
  await page.route('**/api/site/*/settings', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(SITE_SETTINGS) }),
  );
  await page.route('**/api/site/*/pages/*', (route) => {
    const locale = route.request().url().includes('/site/nl/') ? 'nl' : 'en';
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(homePagePayload(locale)),
    });
  });
}

/**
 * The bare-root redirect is a client-side effect: it navigates via wouter, not
 * an HTTP redirect. Wait until the SPA has settled, then assert the pathname.
 */
async function openRootAndSettle(page: Page) {
  await mockApi(page);
  await page.goto('/');
  await page.waitForLoadState('networkidle');
}

// ── Tests ────────────────────────────────────────────────────────────────────
// Each test.describe block gets a fresh browser context (no stored preference)
// with the given `locale`, which sets both Accept-Language and navigator.languages.

test.describe('Dutch-preferring first-time visitor', () => {
  test.use({ locale: 'nl-NL' });

  test('landing on the bare root "/" is redirected to /nl', async ({ page }) => {
    await openRootAndSettle(page);
    await expect(page).toHaveURL(/\/nl$/);
  });

  test('a stored English preference is never overridden by browser language', async ({ page }) => {
    // Returning visitor who explicitly chose English: stored preference wins.
    await page.addInitScript(() => {
      window.localStorage.setItem('oxot-locale', 'en');
    });
    await openRootAndSettle(page);
    // Give any (buggy) redirect effect a chance to fire before asserting.
    await page.waitForTimeout(500);
    expect(new URL(page.url()).pathname).toBe('/');
  });

  test('an explicit deep link keeps its own locale path untouched', async ({ page }) => {
    await mockApi(page);
    await page.goto('/nl/home');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    expect(new URL(page.url()).pathname).toBe('/nl/home');
  });
});

test.describe('English-preferring first-time visitor', () => {
  test.use({ locale: 'en-US' });

  test('landing on the bare root "/" stays on the English default path', async ({ page }) => {
    await openRootAndSettle(page);
    await page.waitForTimeout(500);
    expect(new URL(page.url()).pathname).toBe('/');
  });
});

test.describe('Unknown-language first-time visitor', () => {
  test.use({ locale: 'fr-FR' });

  test('landing on the bare root "/" stays on the English default path', async ({ page }) => {
    await openRootAndSettle(page);
    await page.waitForTimeout(500);
    expect(new URL(page.url()).pathname).toBe('/');
  });
});

test.describe('Stored Dutch preference, English browser', () => {
  test.use({ locale: 'en-US' });

  test('a returning visitor with a stored Dutch preference is sent to /nl', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('oxot-locale', 'nl');
    });
    await openRootAndSettle(page);
    await expect(page).toHaveURL(/\/nl$/);
  });
});
