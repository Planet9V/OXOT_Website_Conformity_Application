/**
 * Regression check for related-services relationship resolution.
 *
 * No test framework is configured in this workspace, so this file is a
 * self-contained assertion script runnable with Node's native TypeScript
 * support: `node --experimental-strip-types related-services.test.ts`
 * (wired as `pnpm --filter @workspace/oxot-web test`).
 *
 * It guards the bug where the related-services strip keyed relationships on the
 * mutable page slug: renaming a service page's slug in the CMS silently dropped
 * its card. Relationships must instead resolve through the immutable serviceKey.
 */
import assert from 'node:assert/strict';
import { resolveRelatedServices, type RelatablePage } from './related-services.logic.ts';

// The six seeded core service pages, each with serviceKey === original slug.
const seeded = (): RelatablePage[] => [
  { slug: 'ot-security-assessments', serviceKey: 'ot-security-assessments' },
  { slug: 'ot-security-programmes', serviceKey: 'ot-security-programmes' },
  { slug: 'ot-security-baseline', serviceKey: 'ot-security-baseline' },
  { slug: 'secure-remote-access', serviceKey: 'secure-remote-access' },
  { slug: 'architecture-segmentation', serviceKey: 'architecture-segmentation' },
  { slug: 'capability-transfer', serviceKey: 'capability-transfer' },
];

const slugs = (pages: RelatablePage[]) => pages.map((p) => p.slug);

// 1. Baseline: an unmodified service page resolves its editorial neighbours.
assert.deepEqual(
  slugs(resolveRelatedServices(seeded(), 'ot-security-assessments')),
  ['ot-security-programmes', 'ot-security-baseline'],
  'baseline related services',
);

// 2. Non-service page renders nothing.
assert.deepEqual(
  resolveRelatedServices([...seeded(), { slug: 'about', serviceKey: 'about' }], 'about'),
  [],
  'non-service page has no strip',
);

// 3. The CURRENT page's slug is renamed in the CMS. Its serviceKey is unchanged,
//    so it must still resolve its relationships (the core regression).
const currentRenamed = seeded().map((p) =>
  p.serviceKey === 'ot-security-assessments' ? { ...p, slug: 'ot-assessments-2026' } : p,
);
assert.deepEqual(
  slugs(resolveRelatedServices(currentRenamed, 'ot-assessments-2026')),
  ['ot-security-programmes', 'ot-security-baseline'],
  'renamed current page still resolves its related services',
);

// 4. A RELATED page's slug is renamed. The card must survive and point at the
//    new slug (not vanish, not 404 on the stale slug).
const relatedRenamed = seeded().map((p) =>
  p.serviceKey === 'ot-security-baseline' ? { ...p, slug: 'ot-baseline-v2' } : p,
);
const relatedItems = resolveRelatedServices(relatedRenamed, 'ot-security-assessments');
assert.deepEqual(
  slugs(relatedItems),
  ['ot-security-programmes', 'ot-baseline-v2'],
  'renamed related page keeps its card at the new slug',
);

// 5. A related page that is missing (unpublished/deleted) is skipped, not blank.
const missingOne = seeded().filter((p) => p.serviceKey !== 'ot-security-baseline');
assert.deepEqual(
  slugs(resolveRelatedServices(missingOne, 'ot-security-assessments')),
  ['ot-security-programmes'],
  'missing related page is skipped',
);

// 6. Rollout fallback: legacy rows with a null serviceKey fall back to slug, so
//    an un-backfilled page never regresses to a blank strip.
const legacyNulls: RelatablePage[] = seeded().map((p) => ({ slug: p.slug, serviceKey: null }));
assert.deepEqual(
  slugs(resolveRelatedServices(legacyNulls, 'ot-security-assessments')),
  ['ot-security-programmes', 'ot-security-baseline'],
  'null serviceKey falls back to slug',
);

console.log('related-services: 6 assertions passed');
