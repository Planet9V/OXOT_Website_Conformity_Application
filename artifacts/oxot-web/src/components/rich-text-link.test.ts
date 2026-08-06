/**
 * Regression check for the RichText link-attribute contracts.
 *
 * No test framework is configured in this workspace, so this file is a
 * self-contained assertion script runnable with Node's native TypeScript
 * support: `node --experimental-strip-types rich-text-link.test.ts`
 * (wired into `pnpm --filter @workspace/oxot-web test`).
 *
 * The load-bearing contract: affiliate tracker links (`/api/go/:id`) must
 * NEVER carry `noreferrer` — the /api/go redirect handler attributes which
 * page a click came from via the Referer header, so adding noreferrer would
 * silently break click-source analytics while everything still "works".
 */
import assert from 'node:assert/strict';
import { safeHref, isTrackerHref, linkRel, opensInNewTab } from './rich-text-link.ts';

// --- tracker links: rel must be sponsored/nofollow, never noreferrer --------

const trackerHrefs = ['/api/go/1', '/api/go/42?utm=x'];
for (const href of trackerHrefs) {
  assert.equal(isTrackerHref(href), true, `${href} should be a tracker link`);
  const rel = linkRel(href);
  assert.equal(rel, 'sponsored nofollow', `${href} rel should be "sponsored nofollow"`);
  assert.ok(!rel!.includes('noreferrer'), `${href} must NOT set noreferrer (Referer attribution)`);
  assert.equal(opensInNewTab(href), true, `${href} should open in a new tab`);
  assert.equal(safeHref(href), href, `${href} should be an allowed target`);
}

// --- external links: standard noopener noreferrer ----------------------------

for (const href of ['https://partner.example.com/x', 'http://example.com']) {
  assert.equal(linkRel(href), 'noopener noreferrer', `${href} should get noopener noreferrer`);
  assert.equal(opensInNewTab(href), true);
  assert.equal(isTrackerHref(href), false);
}

// An external URL that merely CONTAINS /api/go/ is still a tracker by rule
// (href.includes) — document the current behavior so a change is deliberate.
assert.equal(linkRel('https://evil.example.com/api/go/1'), 'sponsored nofollow');

// --- internal links: no rel, same tab ----------------------------------------

for (const href of ['/services', '/en/cra', '#section']) {
  assert.equal(linkRel(href), undefined, `${href} should have no rel`);
  assert.equal(opensInNewTab(href), false, `${href} should client-route in the same tab`);
}

// --- safeHref: unsafe targets are rejected ------------------------------------

const unsafe = [
  'javascript:alert(1)',
  'JAVASCRIPT:alert(1)',
  'data:text/html,<script>1</script>',
  '//protocol-relative.example.com',
  'vbscript:x',
  '',
  '   ',
];
for (const href of unsafe) {
  assert.equal(safeHref(href), null, `${JSON.stringify(href)} must be rejected`);
}

const safe: [string, string][] = [
  ['/api/go/7', '/api/go/7'],
  ['  https://example.com/a  ', 'https://example.com/a'],
  ['mailto:hello@oxot.example', 'mailto:hello@oxot.example'],
  ['tel:+31201234567', 'tel:+31201234567'],
  ['#faq', '#faq'],
];
for (const [input, expected] of safe) {
  assert.equal(safeHref(input), expected, `${input} should be allowed`);
}

console.log('rich-text-link.test.ts: all assertions passed');
