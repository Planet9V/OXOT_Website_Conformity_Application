import { useEffect } from 'react';

export interface SeoData {
  title?: string | null;
  description?: string | null;
  keywords?: string | null;
  canonicalUrl?: string | null;
  noindex?: boolean;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string | null | undefined) {
  const existing = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!content) {
    existing?.remove();
    return;
  }
  let el = existing as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string | null | undefined) {
  const existing = document.head.querySelector(`link[rel="${rel}"]`);
  if (!href) {
    existing?.remove();
    return;
  }
  let el = existing as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * Imperatively manages document <head> SEO/social tags for the current page.
 * This is a client-rendered SPA (no SSR), so meta tags are set at runtime.
 */
export function useSeo(data: SeoData | null | undefined) {
  const title = data?.title ?? null;
  const description = data?.description ?? null;
  const keywords = data?.keywords ?? null;
  const canonicalUrl = data?.canonicalUrl ?? null;
  const noindex = data?.noindex ?? false;
  const ogTitle = data?.ogTitle ?? null;
  const ogDescription = data?.ogDescription ?? null;
  const ogImage = data?.ogImage ?? null;

  useEffect(() => {
    if (!data) return;
    if (title) document.title = title;
    upsertMeta('name', 'description', description);
    upsertMeta('name', 'keywords', keywords);
    upsertMeta('name', 'robots', noindex ? 'noindex,nofollow' : null);
    upsertLink('canonical', canonicalUrl);
    upsertMeta('property', 'og:title', ogTitle || title);
    upsertMeta('property', 'og:description', ogDescription || description);
    upsertMeta('property', 'og:image', ogImage);
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('name', 'twitter:card', ogImage ? 'summary_large_image' : 'summary');
  }, [data, title, description, keywords, canonicalUrl, noindex, ogTitle, ogDescription, ogImage]);
}
