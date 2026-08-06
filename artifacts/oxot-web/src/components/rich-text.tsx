import type { ReactNode } from 'react';
import { stripLocalePrefix } from '@/components/sections/article-links';
import { safeHref, linkRel, opensInNewTab } from '@/components/rich-text-link';

// Re-export for existing consumers (article-section.tsx imports it from here).
export { safeHref };

// Minimal inline renderer: turns markdown links `[label](href)` into anchors and
// leaves the rest as plain text. Used so AI-inserted affiliate links (which point
// at the /api/go tracking redirect) render as real, tracked links in page copy.
const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;

export function RichText({ text }: { text: string | null | undefined }) {
  if (!text) return null;
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  const re = new RegExp(LINK_RE.source, 'g');
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    const label = match[1];
    const rawHref = match[2];
    const safe = safeHref(rawHref);
    // Normalize locale-prefixed CMS links (`/en/cra`, `/nl/services`) to the
    // SPA's locale-less route so they don't dead-end on the 404 page.
    const href = safe ? stripLocalePrefix(safe) : null;
    if (!href) {
      // Unsafe target: keep the label as plain text, drop the link.
      nodes.push(label);
      lastIndex = match.index + match[0].length;
      continue;
    }
    const newTab = opensInNewTab(href);
    // Internal /api/go tracker links must NOT set noreferrer, or the redirect
    // handler loses the Referer header it uses to attribute the click's source.
    const rel = linkRel(href);
    nodes.push(
      <a
        key={`lnk-${key++}`}
        href={href}
        {...(newTab ? { target: '_blank' } : {})}
        {...(rel ? { rel } : {})}
        className="text-primary font-medium underline underline-offset-2 hover:text-primary/80"
      >
        {label}
      </a>,
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return <>{nodes}</>;
}
