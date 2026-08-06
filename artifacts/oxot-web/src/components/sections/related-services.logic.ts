/**
 * Pure resolution logic for the related-services strip, kept free of React so it
 * can be unit-tested with Node's native TypeScript runner (see the sibling
 * `related-services.test.ts`).
 *
 * The whole point of this module is that relationships are keyed on each page's
 * immutable `serviceKey`, NOT its slug. An admin can rename a service page's
 * slug in the CMS and the strip still resolves, because both the current page
 * and its related pages are matched through the stable identity.
 */

export interface RelatablePage {
  slug: string;
  serviceKey?: string | null;
}

/**
 * Adjacent services shown at the bottom of each core service page, following the
 * natural engagement arc (assess → programme → baseline → transfer). Keyed on
 * `serviceKey`, which equals the original slug at seed time and never changes
 * when the CMS slug is edited.
 */
export const RELATED: Record<string, string[]> = {
  'ot-security-assessments': ['ot-security-programmes', 'ot-security-baseline'],
  'ot-security-programmes': ['ot-security-assessments', 'ot-security-baseline', 'capability-transfer'],
  'architecture-segmentation': ['secure-remote-access', 'ot-security-baseline', 'ot-security-programmes'],
  'secure-remote-access': ['architecture-segmentation', 'ot-security-baseline'],
  'ot-security-baseline': ['ot-security-assessments', 'ot-security-programmes', 'capability-transfer'],
  'capability-transfer': ['ot-security-programmes', 'ot-security-baseline'],
};

/**
 * Stable identity of a page: its `serviceKey`, falling back to `slug` for rows
 * not yet backfilled (serviceKey === slug at seed time, so this preserves
 * behavior during rollout and never regresses cards to blank).
 */
export function serviceKeyOf(page: RelatablePage): string {
  return page.serviceKey ?? page.slug;
}

/**
 * Resolve the ordered list of related pages for the page currently served at
 * `slug`. Relationships are looked up by stable serviceKey — never by the slug
 * itself — so a slug rename in the CMS never silently drops a card. Related keys
 * with no matching page in `pages` (e.g. unpublished or deleted) are skipped.
 */
export function resolveRelatedServices<T extends RelatablePage>(pages: T[], slug: string): T[] {
  const current = pages.find((p) => p.slug === slug);
  if (!current) return [];

  const relatedKeys = RELATED[serviceKeyOf(current)] ?? [];
  if (relatedKeys.length === 0) return [];

  const byKey = new Map(pages.map((p) => [serviceKeyOf(p), p]));
  return relatedKeys.map((key) => byKey.get(key)).filter((p): p is T => !!p);
}
