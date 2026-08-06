/**
 * Smoke test: locale-prefixed in-content links land on a real page
 *
 * CMS markdown frequently links with a locale prefix (`/en/services`,
 * `/nl/services`). The article link layer (`stripLocalePrefix`, applied in
 * `MdLink` / `RichText`) strips that authoring prefix so the link becomes a
 * wouter `<Link href="/services">`. Wouter then resolves it relative to the
 * active locale's router base:
 *   – English pages are mounted at the site root → `/services`
 *   – Dutch pages are mounted under a nested `/nl` router → `/nl/services`
 * Either way the link must land on a real page rather than the 404 route.
 *
 * A unit test covers the pure `stripLocalePrefix` function, but nothing proves
 * the rendered link actually navigates to a real page in a browser. This test
 * closes that gap end to end for BOTH locales: it opens a content page at the
 * locale's real URL, whose body contains a locale-prefixed service link, clicks
 * it, and asserts the destination renders the real service page — not "404 Not
 * Found". A future refactor of the router or the link renderer that silently
 * reintroduced the dead-end would fail here even if the unit test still passed.
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

/** The content page we open — its body links to the services page with a locale prefix. */
const SOURCE_SLUG = 'cra';
/** The destination the in-content link points at (via `/en/services` or `/nl/services`). */
const DEST_SLUG = 'services';

type Locale = 'en' | 'nl';

/**
 * Per-locale expectations. Each locale is driven through its REAL public URL:
 * English at the site root, Dutch under the nested `/nl` router. The authored
 * in-content link carries that locale's prefix; after `stripLocalePrefix` +
 * wouter's base resolution the rendered anchor must point at the locale's real
 * destination path.
 */
const CASES: Record<
  Locale,
  {
    /** URL of the source content page for this locale. */
    sourceUrl: string;
    /** Locale-prefixed href as authored in the CMS markdown. */
    authoredLink: string;
    /** Visible link label in the article body. */
    linkLabel: string;
    /** Expected rendered anchor href AND landing URL after wouter base resolution. */
    destPath: string;
    /** Distinctive text only the real destination page renders. */
    destMarker: string;
  }
> = {
  en: {
    sourceUrl: `/${SOURCE_SLUG}`,
    authoredLink: `/en/${DEST_SLUG}`,
    linkLabel: 'view our services',
    destPath: `/${DEST_SLUG}`,
    destMarker: 'Full OT security service portfolio.',
  },
  nl: {
    sourceUrl: `/nl/${SOURCE_SLUG}`,
    authoredLink: `/nl/${DEST_SLUG}`,
    linkLabel: 'bekijk onze diensten',
    destPath: `/nl/${DEST_SLUG}`,
    destMarker: 'Volledig OT-beveiligingsdienstenportfolio.',
  },
};

/** Source page: an article whose markdown links to the services page WITH a locale prefix. */
function sourcePagePayload(locale: Locale) {
  const { authoredLink, linkLabel } = CASES[locale];
  const markdown =
    locale === 'nl'
      ? `## Overzicht\n\nVoor meer informatie, [${linkLabel}](${authoredLink}).`
      : `## Overview\n\nFor more information, [${linkLabel}](${authoredLink}).`;
  return {
    id: 1,
    slug: SOURCE_SLUG,
    title: 'Cyber Resilience Act',
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
      { id: 1, type: 'article', order: 0, data: { title: 'Cyber Resilience Act', excerpt: 'Intro.', markdown } },
    ],
  };
}

/** Destination page: the real services page with a distinctive marker paragraph. */
function destPagePayload(locale: Locale) {
  const { destMarker } = CASES[locale];
  const title = locale === 'nl' ? 'Diensten' : 'Services';
  return {
    id: 2,
    slug: DEST_SLUG,
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
      { id: 1, type: 'article', order: 0, data: { title, excerpt: destMarker, markdown: `## ${title}\n\n${destMarker}` } },
    ],
  };
}

/**
 * Register API mocks. Playwright matches routes LIFO, so the broad catch-all is
 * registered first (lowest priority) and the specific mocks after. getPage
 * returns the source or destination payload depending on the requested slug and
 * derives the locale from the URL's `/site/<locale>/` segment.
 */
async function mockApi(page: Page) {
  await page.route('**/api/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
  );
  await page.route('**/api/site/*/settings', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(SITE_SETTINGS) }),
  );
  await page.route('**/api/site/*/navigation', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(NAV_ITEMS) }),
  );
  // getPage: **/pages/<slug> — registered before listPages so the specific pattern wins.
  await page.route('**/api/site/*/pages/*', (route) => {
    const url = route.request().url();
    const locale: Locale = url.includes('/site/nl/') ? 'nl' : 'en';
    const payload = url.endsWith(`/pages/${DEST_SLUG}`)
      ? destPagePayload(locale)
      : sourcePagePayload(locale);
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(payload) });
  });
  // listPages (related-services strip): no related content needed here.
  await page.route('**/api/site/*/pages', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
  );
}

/**
 * Open the locale's source page at its real URL, click the locale-prefixed
 * in-content link, and assert we land on the real destination page (at the
 * locale-correct URL) rather than the 404 route.
 */
async function assertLinkLandsOnRealPage(page: Page, locale: Locale) {
  const c = CASES[locale];
  await mockApi(page);
  await page.goto(c.sourceUrl);
  await page.waitForLoadState('networkidle');

  // The in-content link is authored as `/en/services` (or `/nl/services`); after
  // stripping the prefix and wouter's base resolution, the rendered anchor must
  // point at the locale's real destination path.
  const link = page.getByRole('link', { name: c.linkLabel });
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute('href', c.destPath);

  await link.click();

  // We must land on the real services page at the locale-correct URL …
  await expect(page).toHaveURL(new RegExp(`${c.destPath.replace(/\//g, '\\/')}$`));
  await expect(page.getByText(c.destMarker).first()).toBeVisible();
  // … and NOT on the 404 route.
  await expect(page.getByRole('heading', { name: /404 Not Found/i })).toHaveCount(0);
}

// ── Tests ────────────────────────────────────────────────────────────────────

test('en: /en-prefixed in-content link resolves to the real page at the root', async ({ page }) => {
  await assertLinkLandsOnRealPage(page, 'en');
});

test('nl: /nl-prefixed in-content link resolves to the real Dutch page under /nl', async ({ page }) => {
  await assertLinkLandsOnRealPage(page, 'nl');
});
