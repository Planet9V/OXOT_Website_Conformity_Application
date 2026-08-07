import { useEffect } from 'react';

/**
 * Injects a <script type="application/ld+json"> into <head> for structured data.
 * Client-rendered (SPA), keyed by id so re-renders replace rather than duplicate;
 * removed on unmount so it never leaks onto other routes.
 */
export function JsonLd({ id, data }: { id: string; data: Record<string, unknown> }) {
  const json = JSON.stringify(data);
  useEffect(() => {
    let el = document.getElementById(id) as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement('script');
      el.type = 'application/ld+json';
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = json;
    return () => {
      el?.remove();
    };
  }, [id, json]);
  return null;
}
