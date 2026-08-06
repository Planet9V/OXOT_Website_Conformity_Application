/**
 * Pure, framework-free helpers for locale-in-URL routing.
 *
 * Dutch public pages live under a "/nl" path prefix; English is the default
 * (no prefix). Keeping this logic in a plain module lets it be unit-tested
 * without React or wouter.
 */

export type Locale = 'en' | 'nl';

/** Locale implied by a path: "/nl" or "/nl/..." is Dutch, everything else English. */
export function localeForPath(path: string): Locale {
  return path === '/nl' || path.startsWith('/nl/') ? 'nl' : 'en';
}

/** Remove a leading "/nl" locale segment, returning the locale-agnostic path. */
export function stripLocalePrefix(path: string): string {
  return path.replace(/^\/nl(?=\/|$)/, '') || '/';
}

/**
 * Admin lives outside the localized public subtree and is served only at
 * "/admin/*" (never "/nl/admin/*"). Such paths must never have a locale prefix
 * added, or the language toggle would strand the user on a non-existent route.
 */
export function isLocaleAgnosticPath(path: string): boolean {
  const bare = stripLocalePrefix(path);
  return bare === '/admin' || bare.startsWith('/admin/');
}

/** The URL for the current path rendered in the given locale. */
export function localeHref(currentPath: string, next: Locale): string {
  const bare = stripLocalePrefix(currentPath);
  if (next !== 'nl') return bare;
  return bare === '/' ? '/nl' : `/nl${bare}`;
}

/**
 * Single-segment public routes served by React (not the CMS `/:slug` page).
 * These render identically in both locales regardless of any `pages` row, so
 * the language switcher must never treat them as translatable content.
 */
const RESERVED_SLUGS = new Set(['frameworks', 'conformity-platform']);

/**
 * The CMS slug a path resolves to, or `null` when the path is not a
 * CMS-backed `/:slug` content page.
 *
 * Only single-segment public paths that aren't a reserved static route map to
 * a CMS page (fetched via `GET /api/site/:locale/pages/:slug`). Everything else
 * — the home page, admin, multi-segment routes like "/frameworks/matrix" — is
 * rendered by React in every locale and is therefore always available.
 *
 * The language switcher uses this to know whether it should check translation
 * availability before offering to switch: a content page may exist only in
 * English, and toggling to Dutch would otherwise strand the reader on 404.
 */
export function contentSlugForPath(path: string): string | null {
  if (isLocaleAgnosticPath(path)) return null;
  const bare = stripLocalePrefix(path);
  const segments = bare.split('/').filter(Boolean);
  if (segments.length !== 1) return null;
  const slug = segments[0];
  if (RESERVED_SLUGS.has(slug)) return null;
  return slug;
}

/**
 * Pick a supported locale from an ordered list of browser language tags
 * (`navigator.languages`, most-preferred first). The first tag whose primary
 * subtag is a supported locale wins, so a browser that prefers Dutch over
 * English resolves to "nl". Tags for unsupported languages are skipped, and an
 * empty/unknown list falls back to the default "en".
 */
export function preferredLocaleFromLanguages(
  languages: readonly string[] | undefined,
): Locale {
  for (const tag of languages ?? []) {
    const primary = tag.toLowerCase().split('-')[0];
    if (primary === 'nl') return 'nl';
    if (primary === 'en') return 'en';
  }
  return 'en';
}
