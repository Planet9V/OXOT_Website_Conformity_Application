import type { SeoData } from '@/hooks/use-seo';

// Default social-share image for the funnel (a real captured screenshot asset).
const DEFAULT_OG_IMAGE = '/workbench-dossier.png';

/**
 * Builds complete per-page SEO data for a static funnel route: title,
 * description, an absolute canonical URL, and Open Graph tags (title/description
 * mirror the page; image defaults to the platform screenshot). Origin is read at
 * runtime (client-rendered SPA); absolute URLs are omitted during SSR/build.
 */
export function pageSeo(
  path: string,
  d: { title: string; description: string; ogImage?: string },
): SeoData {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const img = d.ogImage ?? DEFAULT_OG_IMAGE;
  return {
    title: d.title,
    description: d.description,
    canonicalUrl: origin ? `${origin}${path}` : undefined,
    ogTitle: d.title,
    ogDescription: d.description,
    ogImage: origin ? `${origin}${img}` : img,
  };
}
