/**
 * Link classification for markdown rendered inside article content.
 *
 * The article renderer sends most root-relative links through wouter's client
 * router. That is correct for in-app pages (e.g. `/cra`), but wrong for two
 * kinds of link that must trigger a real browser navigation:
 *
 *  1. Static documents served as files (PDFs, decks, and the `.md` source
 *     documents in the Conformity Source Library). Client-routing these lands
 *     on the SPA's NotFound page instead of opening the file.
 *  2. Cross-artifact links to sibling apps mounted under a different base path
 *     (e.g. the Conformity app at `/conformity/*`). These live outside this
 *     SPA's route table, so wouter would render NotFound.
 *
 * Keeping this as a pure, exported function makes it unit-testable without
 * rendering React.
 */

/** Static/downloadable asset extensions that must resolve to a real file. */
export const FILE_LINK_RE =
  /\.(pdf|pptx?|key|docx?|xlsx?|csv|md|txt|zip|mp4|mov|png|jpe?g|svg)(\?|#|$)/i;

/**
 * Leading locale segment (`/en` or `/nl`) on a root-relative path.
 *
 * Much CMS markdown links with a locale prefix (e.g. `/en/cra`,
 * `/nl/services`), but the public SPA registers routes as a single
 * locale-less segment (`/:slug`) with the active locale held in
 * localStorage. A two-segment `/en/cra` matches no route and renders the
 * 404 page. The lookahead keeps `/energy`, `/nls`, etc. untouched — only a
 * `/en` or `/nl` that is the whole path or followed by `/` is a locale prefix.
 */
export const LOCALE_PREFIX_RE = /^\/(en|nl)(?=\/|$)/i;

/**
 * Strip a leading `/en` or `/nl` locale prefix from a root-relative internal
 * link so it matches the SPA's locale-less `/:slug` route table.
 *
 * Leaves external URLs, protocol-relative URLs, anchors, and non-locale paths
 * unchanged. A bare `/en` or `/nl` collapses to `/` (the home page).
 */
export function stripLocalePrefix(url: string): string {
  if (!url.startsWith('/') || url.startsWith('//')) return url;
  if (!LOCALE_PREFIX_RE.test(url)) return url;
  const stripped = url.replace(LOCALE_PREFIX_RE, '');
  return stripped === '' ? '/' : stripped;
}

/** Base paths of sibling artifacts that are not part of this SPA's router. */
export const CROSS_ARTIFACT_PREFIXES = ['/conformity/', '/api/'];

/**
 * True when a root-relative link should be rendered as a plain anchor (direct
 * browser navigation) rather than a wouter client-side route.
 *
 * Only applies to root-relative (`/…`) URLs. External URLs, mailto/tel, and
 * in-page anchors are handled by the caller before this is consulted.
 */
export function isDirectDocumentLink(url: string): boolean {
  if (!url.startsWith('/') || url.startsWith('//')) return false;
  if (FILE_LINK_RE.test(url)) return true;
  if (CROSS_ARTIFACT_PREFIXES.some((prefix) => url.startsWith(prefix))) return true;
  return false;
}
