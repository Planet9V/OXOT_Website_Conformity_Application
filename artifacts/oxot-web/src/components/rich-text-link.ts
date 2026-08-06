// Pure link-attribute rules for markdown links rendered by RichText.
// Extracted from rich-text.tsx so the contracts are unit-testable without JSX.

/**
 * Only these schemes/shapes are allowed as link targets. Anything else
 * (e.g. `javascript:`, `data:`, protocol-relative `//evil`) is treated as
 * unsafe and the link is rendered as plain text instead of an anchor. CMS
 * markdown is admin-authored, but this is cheap defense-in-depth against a
 * stored-XSS vector.
 */
export function safeHref(href: string): string | null {
  const trimmed = href.trim();
  if (!trimmed) return null;
  // Internal absolute path or in-page anchor.
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return trimmed;
  if (trimmed.startsWith('#')) return trimmed;
  // Explicit allowed schemes only.
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^mailto:/i.test(trimmed)) return trimmed;
  if (/^tel:/i.test(trimmed)) return trimmed;
  return null;
}

/** An affiliate click-tracking redirect link (`/api/go/:id`). */
export function isTrackerHref(href: string): boolean {
  return href.includes('/api/go/');
}

/**
 * The rel attribute for a rendered link.
 *
 * CONTRACT: internal /api/go tracker links must NOT set `noreferrer` — the
 * redirect handler relies on the Referer header to attribute which page the
 * click came from. They get `sponsored nofollow` instead. External links get
 * the usual `noopener noreferrer`; internal links get no rel at all.
 */
export function linkRel(href: string): string | undefined {
  if (isTrackerHref(href)) return 'sponsored nofollow';
  if (/^https?:\/\//.test(href)) return 'noopener noreferrer';
  return undefined;
}

/** Tracker and external links open in a new tab; internal links client-route. */
export function opensInNewTab(href: string): boolean {
  return isTrackerHref(href) || /^https?:\/\//.test(href);
}
