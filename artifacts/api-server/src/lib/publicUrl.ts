// Public origin helpers shared across non-JSON public routes (SEO, newsletter).
//
// The web SPA is served at the site root; the API server owns "/api". Social
// crawlers and search engines need absolute URLs that point at the public web
// origin (the SPA), never at "/api".

function trimSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

/** Public web app origin (the SPA root), used for canonical/sitemap URLs. */
export function publicWebOrigin(): string {
  const explicit = process.env["PUBLIC_WEB_URL"];
  if (explicit) return trimSlash(explicit);
  const domain = process.env["REPLIT_DEV_DOMAIN"];
  return domain ? `https://${domain}` : "";
}

/** Absolute URL for a path on the public web origin (leading slash optional). */
export function absoluteWebUrl(pathname: string): string {
  const origin = publicWebOrigin();
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${origin}${path}`;
}
