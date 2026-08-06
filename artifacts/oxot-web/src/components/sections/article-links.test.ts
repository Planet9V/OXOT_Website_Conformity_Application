/**
 * Regression check for article link classification.
 *
 * No test framework is configured in this workspace, so this file is a
 * self-contained assertion script runnable with Node's native TypeScript
 * support: `node --experimental-strip-types article-links.test.ts`
 * (wired as `pnpm --filter @workspace/oxot-web test`).
 *
 * It guards the bug where `/conformity/sources/*.md` reference links from
 * article content were client-routed by wouter and fell through to NotFound
 * instead of opening the static source document.
 */
import assert from 'node:assert/strict';
import { isDirectDocumentLink, stripLocalePrefix } from './article-links.ts';

const directLinks = [
  // Static source documents in the Conformity library (the regressed case).
  '/conformity/sources/cra-ce-marking-pathways.md',
  '/conformity/sources/tia-family-of-standards.md',
  '/conformity/sources/datacenter-supplier-status-sl3-sl4.md',
  // PDFs / decks referenced from article content.
  '/conformity/sources/cra-customer-journeys.pdf',
  '/conformity/sources/cra-preparation-service.key',
  '/downloads/oxot-sentyron-sell-sheet-m-personas.pdf',
  // The Conformity library index — a cross-artifact link with no extension.
  '/conformity/sources',
  // Query/hash suffixes must not defeat extension detection.
  '/downloads/deck.pdf?v=2',
  '/conformity/sources/tia.md#part-2',
];

const clientRouteLinks = [
  // In-app pages must stay on wouter.
  '/cra',
  '/en/cra',
  '/sentyron',
  '/data-center',
  '/iec-62443',
];

for (const url of directLinks) {
  assert.equal(isDirectDocumentLink(url), true, `expected direct anchor for: ${url}`);
}
for (const url of clientRouteLinks) {
  assert.equal(isDirectDocumentLink(url), false, `expected wouter route for: ${url}`);
}
// Protocol-relative and non-root links are never treated as direct doc links here.
assert.equal(isDirectDocumentLink('//evil.com/x.pdf'), false);
assert.equal(isDirectDocumentLink('relative/x.md'), false);

// --- Locale-prefix normalization ---------------------------------------------
// CMS markdown links with a locale prefix (`/en/cra`, `/nl/services`) must be
// normalized to the SPA's locale-less `/:slug` route, or they dead-end on the
// 404 page. Guards the regression this task fixed.
const localeStrip: [string, string][] = [
  ['/en/cra', '/cra'],
  ['/nl/services', '/services'],
  ['/en/ot-security-assessments', '/ot-security-assessments'],
  ['/nl/cyber-digital-twin', '/cyber-digital-twin'],
  // Bare locale collapses to the home page.
  ['/en', '/'],
  ['/nl', '/'],
  // Query/hash suffixes are preserved after the prefix is removed.
  ['/en/frameworks?tab=all', '/frameworks?tab=all'],
  ['/nl/cra#faq', '/cra#faq'],
];
for (const [input, expected] of localeStrip) {
  assert.equal(stripLocalePrefix(input), expected, `expected ${expected} for: ${input}`);
}

// Non-locale paths, look-alikes, and external/anchor links are left untouched.
const localePassthrough = [
  '/cra',
  '/services',
  '/energy', // starts with "/en" but is not a locale segment
  '/nls-report', // starts with "/nl" but is not a locale segment
  '/conformity/sources/tia.md',
  '/api/go/aff-123',
  '#faq',
  '//evil.com/x',
  'https://example.com/en/cra',
];
for (const url of localePassthrough) {
  assert.equal(stripLocalePrefix(url), url, `expected unchanged: ${url}`);
}

console.log(
  `article-links: ${
    directLinks.length + clientRouteLinks.length + 2 + localeStrip.length + localePassthrough.length
  } assertions passed`,
);
