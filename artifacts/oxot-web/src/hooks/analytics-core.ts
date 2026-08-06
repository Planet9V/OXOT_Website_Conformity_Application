/**
 * Pure analytics logic — no React, no path-alias imports.
 * Kept separate so it can be unit-tested with plain Node.js.
 */

export const CONSENT_KEY = 'oxot-cookie-consent';

export function hasConsent(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === 'accepted';
  } catch {
    return false;
  }
}

export function getSessionId(): string {
  try {
    let id = localStorage.getItem('oxot-visitor');
    if (!id) {
      id = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem('oxot-visitor', id);
    }
    return id;
  } catch {
    return 'anon';
  }
}

export function getDevice(): string {
  const w = window.innerWidth;
  if (w < 768) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
}

/**
 * Core beacon dispatch — exported for unit testing.
 * Returns true when a beacon was fired, false when consent is absent/declined.
 */
export function firePageViewBeacon(path: string, locale: string): boolean {
  if (!hasConsent()) return false;

  const payload = {
    path,
    locale,
    sessionId: getSessionId(),
    referrer: (typeof document !== 'undefined' ? document.referrer : '') || undefined,
    device: getDevice(),
  };
  try {
    void fetch('/api/analytics/collect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* never let tracking break the page */
  }
  return true;
}
