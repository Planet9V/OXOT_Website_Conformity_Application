/**
 * Regression guard for locale-in-URL routing.
 *
 * Covers:
 *   – Dutch pages resolve to a "/nl" prefix and English to the default path
 *   – the language toggle NEVER rewrites a locale-agnostic admin path into
 *     "/nl/admin/..." (which has no route and would strand the user)
 *
 * Self-contained assertion script (no test framework needed) — runs with
 * Node's native TypeScript strip-types support, wired via the package.json
 * test script.
 *
 * Run with: node --experimental-strip-types locale-routing.test.ts
 */
import assert from 'node:assert/strict';
import {
  contentSlugForPath,
  isLocaleAgnosticPath,
  localeForPath,
  localeHref,
  preferredLocaleFromLanguages,
  stripLocalePrefix,
} from './locale-routing.ts';

// ── localeForPath: URL is the source of truth ───────────────────────────────
assert.equal(localeForPath('/'), 'en');
assert.equal(localeForPath('/services'), 'en');
assert.equal(localeForPath('/nl'), 'nl');
assert.equal(localeForPath('/nl/services'), 'nl');
// "/nlsomething" is NOT the Dutch subtree (segment boundary matters).
assert.equal(localeForPath('/nlanders'), 'en');

// ── stripLocalePrefix ───────────────────────────────────────────────────────
assert.equal(stripLocalePrefix('/nl'), '/');
assert.equal(stripLocalePrefix('/nl/services'), '/services');
assert.equal(stripLocalePrefix('/services'), '/services');
assert.equal(stripLocalePrefix('/'), '/');
assert.equal(stripLocalePrefix('/nlanders'), '/nlanders');

// ── localeHref: toggling language on a public page ──────────────────────────
assert.equal(localeHref('/', 'nl'), '/nl');
assert.equal(localeHref('/services', 'nl'), '/nl/services');
assert.equal(localeHref('/nl/services', 'en'), '/services');
assert.equal(localeHref('/nl', 'en'), '/');
// Idempotent: asking for the locale the page is already in yields the same URL.
assert.equal(localeHref('/nl/services', 'nl'), '/nl/services');
assert.equal(localeHref('/services', 'en'), '/services');

// ── Admin regression: locale-agnostic paths are never prefixed ──────────────
assert.equal(isLocaleAgnosticPath('/admin'), true);
assert.equal(isLocaleAgnosticPath('/admin/pages'), true);
assert.equal(isLocaleAgnosticPath('/admin/pages/12'), true);
// Even a (malformed) "/nl/admin" is recognized as admin so it is never
// re-prefixed on top of itself.
assert.equal(isLocaleAgnosticPath('/nl/admin/pages'), true);
// Public content pages are NOT locale-agnostic.
assert.equal(isLocaleAgnosticPath('/'), false);
assert.equal(isLocaleAgnosticPath('/services'), false);
assert.equal(isLocaleAgnosticPath('/nl/services'), false);

// The provider guards setLocale with isLocaleAgnosticPath so admin toggles
// never navigate. This asserts the underlying contract the guard relies on:
// were the guard bypassed, localeHref would have produced a dead-end URL.
assert.equal(localeHref('/admin/pages', 'nl'), '/nl/admin/pages');
assert.equal(isLocaleAgnosticPath('/admin/pages'), true);

// ── contentSlugForPath: which paths are translatable CMS pages ──────────────
// Single-segment public paths are CMS "/:slug" content pages (may be one-locale
// only) — the switcher must probe translation availability for these.
assert.equal(contentSlugForPath('/services'), 'services');
assert.equal(contentSlugForPath('/nl/services'), 'services');
// The home page, admin, and multi-segment routes render in every locale via
// React, so they are always available and never gate the switcher.
assert.equal(contentSlugForPath('/'), null);
assert.equal(contentSlugForPath('/nl'), null);
assert.equal(contentSlugForPath('/admin/pages'), null);
assert.equal(contentSlugForPath('/nl/admin/pages'), null);
assert.equal(contentSlugForPath('/frameworks/matrix'), null);
assert.equal(contentSlugForPath('/conformity-platform/regulations'), null);
assert.equal(contentSlugForPath('/newsletter/confirm'), null);
// Reserved single-segment static routes are React-rendered, not CMS slugs.
assert.equal(contentSlugForPath('/frameworks'), null);
assert.equal(contentSlugForPath('/nl/frameworks'), null);
assert.equal(contentSlugForPath('/conformity-platform'), null);

// ── preferredLocaleFromLanguages: first-visit browser-language greeting ──────
// A browser that prefers Dutch over English greets the visitor in Dutch.
assert.equal(preferredLocaleFromLanguages(['nl-NL', 'en-US']), 'nl');
assert.equal(preferredLocaleFromLanguages(['nl']), 'nl');
// Ordering wins: whichever supported locale appears first is chosen.
assert.equal(preferredLocaleFromLanguages(['en-GB', 'nl']), 'en');
// Unsupported languages are skipped until a supported one is found.
assert.equal(preferredLocaleFromLanguages(['fr-FR', 'de', 'nl-BE']), 'nl');
assert.equal(preferredLocaleFromLanguages(['fr-FR', 'en']), 'en');
// No supported language, empty, or missing list falls back to English.
assert.equal(preferredLocaleFromLanguages(['fr-FR', 'de-DE']), 'en');
assert.equal(preferredLocaleFromLanguages([]), 'en');
assert.equal(preferredLocaleFromLanguages(undefined), 'en');

console.log('locale-routing: all locale URL + admin-guard assertions passed ✓');
