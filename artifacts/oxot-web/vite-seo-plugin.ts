import type { Plugin, Connect } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';

// ---------------------------------------------------------------------------
// Server-side SEO middleware for the public SPA.
//
// The web app is a client-rendered Vite SPA served at the site root; the API
// server owns "/api". Two things must exist in server responses (crawlers do
// NOT run JavaScript):
//
//   1. /sitemap.xml and /robots.txt at the SITE ROOT so crawlers reach them.
//   2. Per-page Open Graph / Twitter card meta in the INITIAL HTML for social
//      unfurlers (LinkedIn/X) on public page routes.
//
// The API server produces all of this (it has DB access, incl. page.updatedAt
// which is not on the typed API). This middleware simply proxies the root-level
// crawler requests to the API server's public, non-JSON SEO routes:
//
//   GET /sitemap.xml           -> /api/seo/sitemap.xml
//   GET /robots.txt            -> /api/seo/robots.txt
//   GET /<page> (crawler UA)   -> /api/seo/page-meta?locale=..&slug=..
//
// Human browsers on page routes fall through to the normal SPA (whose useSeo
// hook sets the same tags client-side).
// ---------------------------------------------------------------------------

// Social unfurlers + search engine crawlers. Only agents that fetch HTML for
// cards or indexing need the server-injected meta.
//
// IMPORTANT: This list is CURATED and STRICT. It must stay IDENTICAL in content
// to the BOT_UA_PATTERNS list in artifacts/api-server/src/lib/botDetection.ts —
// keep the two in sync. We deliberately avoid ambiguous in-app-browser
// substrings (bare "whatsapp", "instagram", "fban", "fbav", "line", "gsa",
// etc.) so real humans in in-app browsers fall through to the SPA. For WhatsApp
// we only match the link-unfurler form ("whatsapp/2"), never the bare substring.
export const CRAWLER_UA_PATTERNS: string[] = [
  // Known link-unfurl / search crawler UA tokens
  'googlebot',
  'bingbot',
  'duckduckbot',
  'yandexbot',
  'baiduspider',
  'applebot',
  'facebookexternalhit',
  'facebot',
  'twitterbot',
  'linkedinbot',
  'slackbot',
  'slack-imgproxy',
  'telegrambot',
  'discordbot',
  'pinterest',
  'redditbot',
  'embedly',
  // WhatsApp link preview only — match the unfurler form, NOT the generic
  // "whatsapp" substring that appears in the human in-app browser UA.
  'whatsapp/2',
  // Safe generic engine tokens
  'bot',
  'crawler',
  'spider',
  // Headless / http-client tokens
  'headlesschrome',
  'puppeteer',
  'playwright',
  'selenium',
  'curl',
  'wget',
  'python-requests',
  'axios',
  'go-http-client',
  'java/',
];

// Patterns are matched as literal substrings; escape regex metacharacters so
// entries like "java/" cannot break the combined expression.
const REGEX_META = /[.*+?^${}()|[\]\\]/g;
function escapeRegExp(literal: string): string {
  return literal.replace(REGEX_META, (ch) => '\\' + ch);
}

const CRAWLER_UA_REGEX = new RegExp(
  CRAWLER_UA_PATTERNS.map(escapeRegExp).join('|'),
  'i',
);

function isCrawler(ua: string | undefined): boolean {
  if (!ua) return false;
  return CRAWLER_UA_REGEX.test(ua);
}

/** Absolute origin of the public deployment (used to reach /api/seo/*). */
function apiOrigin(): string {
  const explicit = process.env.PUBLIC_API_URL || process.env.PUBLIC_WEB_URL;
  if (explicit) return explicit.replace(/\/+$/, '');
  const domain = process.env.REPLIT_DEV_DOMAIN;
  return domain ? `https://${domain}` : '';
}

// Default locale for crawler requests. Dutch pages carry a "/nl" URL prefix, so
// a crawler's request path tells us the locale directly; everything else is
// served in the default locale.
const DEFAULT_LOCALE = 'en';

async function fetchFromApi(pathAndQuery: string): Promise<{
  status: number;
  contentType: string;
  body: string;
} | null> {
  const origin = apiOrigin();
  if (!origin) return null;
  try {
    const res = await fetch(`${origin}/api/seo${pathAndQuery}`, {
      headers: { accept: '*/*' },
    });
    const body = await res.text();
    return {
      status: res.status,
      contentType: res.headers.get('content-type') || 'text/plain; charset=utf-8',
      body,
    };
  } catch {
    return null;
  }
}

function send(
  res: ServerResponse,
  status: number,
  contentType: string,
  body: string,
): void {
  res.statusCode = status;
  res.setHeader('content-type', contentType);
  // Let CDNs/crawlers cache briefly; content is DB-driven but changes rarely.
  res.setHeader('cache-control', 'public, max-age=300');
  res.end(body);
}

// Split a "/nl"-prefixed path into its locale and the locale-agnostic remainder.
// "/nl/foo" -> { locale: 'nl', path: '/foo' }; "/foo" -> { locale: 'en', path: '/foo' }.
function splitLocale(pathname: string): { locale: string; path: string } {
  if (pathname === '/nl' || pathname.startsWith('/nl/')) {
    return { locale: 'nl', path: pathname.slice(3) || '/' };
  }
  return { locale: DEFAULT_LOCALE, path: pathname };
}

function pageMetaQuery(pathname: string): string {
  const { locale, path } = splitLocale(pathname);
  // Homepage "/" maps to slug "home"; "/foo" maps to slug "foo".
  const trimmed = path.replace(/^\/+|\/+$/g, '');
  const slug = trimmed === '' ? 'home' : trimmed;
  return `/page-meta?locale=${encodeURIComponent(locale)}&slug=${encodeURIComponent(slug)}`;
}

// Paths that are NOT public content pages and must never be treated as a page
// slug for crawler meta (admin shell, SPA app routes, static assets). The "/nl"
// locale prefix is stripped first so Dutch content routes are classified the
// same way as their English counterparts.
function isNonPageRequest(pathname: string): boolean {
  const { path } = splitLocale(pathname);
  if (path.startsWith('/admin')) return true;
  if (path.startsWith('/api')) return true;
  if (path.startsWith('/newsletter')) return true;
  if (path.startsWith('/@')) return true; // Vite internal
  if (path.startsWith('/src/')) return true;
  if (path.startsWith('/node_modules/')) return true;
  if (path.startsWith('/assets/')) return true;
  // Anything that looks like a file (has an extension) is a static asset.
  if (/\.[a-z0-9]+$/i.test(path)) return true;
  return false;
}

function seoMiddleware(): Connect.NextHandleFunction {
  return (req: IncomingMessage, res: ServerResponse, next: Connect.NextFunction) => {
    void (async () => {
      try {
        const method = (req.method || 'GET').toUpperCase();
        if (method !== 'GET' && method !== 'HEAD') {
          next();
          return;
        }

        const rawUrl = req.url || '/';
        const pathname = rawUrl.split('?')[0] || '/';

        // 1. Root-level sitemap.xml / robots.txt -> always proxy to the API.
        if (pathname === '/sitemap.xml' || pathname === '/robots.txt') {
          const seoPath = pathname === '/sitemap.xml' ? '/sitemap.xml' : '/robots.txt';
          const result = await fetchFromApi(seoPath);
          if (!result) {
            next();
            return;
          }
          send(res, result.status, result.contentType, result.body);
          return;
        }

        // 2. Crawlers on public page routes -> serve server-injected meta.
        const ua = req.headers['user-agent'];
        if (
          isCrawler(Array.isArray(ua) ? ua[0] : ua) &&
          !isNonPageRequest(pathname)
        ) {
          const result = await fetchFromApi(pageMetaQuery(pathname));
          if (result && result.status < 500) {
            send(res, result.status, result.contentType, result.body);
            return;
          }
        }

        next();
      } catch {
        next();
      }
    })();
  };
}

/**
 * Vite plugin that serves the SEO endpoints in both dev and preview servers.
 * Registered before Vite's SPA fallback so root crawler paths are intercepted.
 */
export function seoPlugin(): Plugin {
  return {
    name: 'oxot-seo-middleware',
    configureServer(server) {
      server.middlewares.use(seoMiddleware());
    },
    configurePreviewServer(server) {
      server.middlewares.use(seoMiddleware());
    },
  };
}
