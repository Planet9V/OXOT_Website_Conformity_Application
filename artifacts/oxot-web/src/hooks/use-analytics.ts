import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useLocale } from '@/providers/locale-provider';
import { firePageViewBeacon } from './analytics-core.ts';

export { hasConsent, firePageViewBeacon, CONSENT_KEY } from './analytics-core.ts';

/**
 * Fires a lightweight first-party page-view beacon once per public route view.
 * No cookies; a random session id in localStorage gives coarse unique counts.
 * Skips all tracking when the visitor has declined (or not yet responded to) the
 * cookie consent banner — the value must be explicitly 'accepted'.
 */
export function usePageViewTracker() {
  const [location] = useLocation();
  const { locale } = useLocale();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    const path = window.location.pathname;
    if (lastPath.current === path) return;

    if (!firePageViewBeacon(path, locale)) return;

    lastPath.current = path;
  }, [location, locale]);
}
