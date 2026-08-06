/**
 * URL helpers for building links back to the public web app (the SPA).
 *
 * The origin is resolved from PUBLIC_WEB_URL when set, falling back to the
 * Replit dev domain. These are used for newsletter links, social share cards,
 * and anywhere the API needs to point a reader at a live page.
 */

function trimSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

/** Public web app origin (the SPA), e.g. https://oxot.com — no trailing slash. */
export function webBaseUrl(): string {
  const explicit = process.env["PUBLIC_WEB_URL"];
  if (explicit) return trimSlash(explicit);
  const domain = process.env["REPLIT_DEV_DOMAIN"];
  return domain ? `https://${domain}` : "";
}

/**
 * Full public URL for a CMS page given its slug. The "home" slug lives at the
 * site root; every other slug is a top-level path. Locale is not part of the
 * URL structure (it is persisted client-side), so it is not needed here.
 *
 * Returns an empty string when no origin can be resolved, so callers can treat
 * that as "no shareable URL available".
 */
export function publicPageUrl(slug: string): string {
  const base = webBaseUrl();
  if (!base) return "";
  return slug === "home" ? base : `${base}/${slug}`;
}
