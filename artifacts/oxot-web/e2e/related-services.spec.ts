/**
 * Smoke test: Related-services cards render live CMS title + excerpt
 *
 * The strip at the bottom of each core service page was switched from a
 * hardcoded title/excerpt map to live CMS content sourced from the
 * `/api/site/:locale/pages` (listPages) endpoint — each card's title and
 * excerpt come from `ListPagesResponseItem.title` / `.excerpt`.
 *
 * This guards against a refactor that reintroduces hardcoded copy or drops the
 * `excerpt` field: the mocked listPages payload uses sentinel strings that no
 * static map would contain, so the cards can only display them if they are read
 * live from the API for the current locale.
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

/** The service page we visit — its RELATED map points at the two slugs below. */
const SLUG = 'ot-security-assessments';
const RELATED_SLUGS = ['ot-security-programmes', 'ot-security-baseline'];

/**
 * Sentinel CMS copy per locale. Deliberately distinctive so a reintroduced
 * static map (English marketing copy) could never accidentally match — the
 * cards can only show these if they read the live listPages response.
 */
const CMS = {
  en: {
    'ot-security-programmes': {
      title: 'CMS Programmes Title EN',
      excerpt: 'CMS excerpt for programmes in English.',
    },
    'ot-security-baseline': {
      title: 'CMS Baseline Title EN',
      excerpt: 'CMS excerpt for baseline in English.',
    },
  },
  nl: {
    'ot-security-programmes': {
      title: 'CMS Programmes Titel NL',
      excerpt: 'CMS-samenvatting voor programma’s in het Nederlands.',
    },
    'ot-security-baseline': {
      title: 'CMS Baseline Titel NL',
      excerpt: 'CMS-samenvatting voor baseline in het Nederlands.',
    },
  },
} as const;

type Locale = keyof typeof CMS;

/**
 * Build the listPages payload for a locale. In production `useListPages`
 * returns *all* published pages, so the visited service page must be present
 * too — the strip resolves the current page's stable serviceKey from this list
 * before looking up its related keys. `serviceKey` mirrors the slug at seed time.
 */
function listPagesPayload(locale: Locale) {
  const related = RELATED_SLUGS.map((slug, i) => ({
    id: 100 + i,
    slug,
    serviceKey: slug,
    title: CMS[locale][slug as keyof (typeof CMS)['en']].title,
    excerpt: CMS[locale][slug as keyof (typeof CMS)['en']].excerpt,
    locale,
  }));
  return [
    {
      id: 1,
      slug: SLUG,
      serviceKey: SLUG,
      title: locale === 'nl' ? 'OT-beveiligingsbeoordelingen' : 'OT Security Assessments',
      excerpt: locale === 'nl' ? 'Intro NL.' : 'Intro EN.',
      locale,
    },
    ...related,
  ];
}

/** Build the getPage payload for the visited service page. */
function getPagePayload(locale: Locale) {
  return {
    id: 1,
    slug: SLUG,
    title: locale === 'nl' ? 'OT-beveiligingsbeoordelingen' : 'OT Security Assessments',
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
        data: { title: 'OT Security Assessments', excerpt: 'Intro.', markdown: '## Heading\n\nBody.' },
      },
    ],
  };
}

/**
 * Register API mocks. Playwright matches routes LIFO, so the broad catch-all is
 * registered first (lowest priority) and the specific mocks after. The listPages
 * and getPage endpoints return locale-specific payloads driven by the URL's
 * locale segment, so the same mock serves both `en` and `nl`.
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
  // getPage: **/pages/<slug> — must be registered before the listPages mock so
  // the more specific pattern wins.
  await page.route('**/api/site/*/pages/*', (route) => {
    const locale: Locale = route.request().url().includes('/site/nl/') ? 'nl' : 'en';
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(getPagePayload(locale)),
    });
  });
  // listPages: **/pages (no trailing slug)
  await page.route('**/api/site/*/pages', (route) => {
    const locale: Locale = route.request().url().includes('/site/nl/') ? 'nl' : 'en';
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(listPagesPayload(locale)),
    });
  });
}

/** Seed the stored locale before the app boots (LocaleProvider reads it). */
async function setLocale(page: Page, locale: Locale) {
  await page.addInitScript((loc) => {
    window.localStorage.setItem('oxot-locale', loc as string);
  }, locale);
}

// ── Tests ────────────────────────────────────────────────────────────────────

test('en: related-service cards render live CMS title + excerpt', async ({ page }) => {
  await setLocale(page, 'en');
  await mockApi(page);
  await page.goto(`/${SLUG}`);
  await page.waitForLoadState('networkidle');

  const strip = page.getByRole('heading', { name: 'Related services' }).locator('..').locator('..');
  await expect(strip).toBeVisible();

  // Both related cards show the CMS title AND the CMS excerpt for English.
  for (const slug of RELATED_SLUGS) {
    const { title, excerpt } = CMS.en[slug as keyof (typeof CMS)['en']];
    await expect(page.getByRole('link', { name: new RegExp(title) })).toBeVisible();
    await expect(page.getByText(excerpt)).toBeVisible();
  }
});

test('nl: related-service cards render the localized CMS title + excerpt', async ({ page }) => {
  await mockApi(page);
  // Dutch is URL-derived now: the localized subtree lives at "/nl/<slug>", so
  // visiting the Dutch address is what puts the strip in Dutch (not localStorage).
  await page.goto(`/nl/${SLUG}`);
  await page.waitForLoadState('networkidle');

  // Dutch heading + Dutch CMS copy — proving the strip follows the current locale.
  await expect(page.getByRole('heading', { name: 'Gerelateerde diensten' })).toBeVisible();

  for (const slug of RELATED_SLUGS) {
    const { title, excerpt } = CMS.nl[slug as keyof (typeof CMS)['nl']];
    await expect(page.getByRole('link', { name: new RegExp(title) })).toBeVisible();
    await expect(page.getByText(excerpt)).toBeVisible();
  }

  // The English CMS copy must NOT appear in the Dutch render.
  await expect(page.getByText(CMS.en['ot-security-programmes'].excerpt)).toHaveCount(0);
});

test('related-service card links point at the CMS slug route', async ({ page }) => {
  await setLocale(page, 'en');
  await mockApi(page);
  await page.goto(`/${SLUG}`);
  await page.waitForLoadState('networkidle');

  // Cards link to the locale-less `/<slug>` route (locale lives in localStorage).
  const card = page.getByRole('link', { name: new RegExp(CMS.en['ot-security-baseline'].title) });
  await expect(card).toHaveAttribute('href', '/ot-security-baseline');
});
