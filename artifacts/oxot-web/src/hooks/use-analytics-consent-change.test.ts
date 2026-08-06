/**
 * Regression guard: when a visitor changes their cookie choice *in the same
 * session* via "Cookie settings" — without any page reload — the analytics
 * beacon must immediately respect the new value.
 *
 *   accept → navigate (fires) → open settings → decline → navigate (suppressed)
 *   decline → open settings → accept → navigate (resumes)
 *
 * This works because firePageViewBeacon re-reads consent from localStorage on
 * every call, and the cookie-settings dialog writes the new value to that same
 * localStorage key synchronously (no reload needed).
 *
 * Self-contained assertion script — no test framework required.
 * Run with: node --experimental-strip-types use-analytics-consent-change.test.ts
 * (wired via `pnpm --filter @workspace/oxot-web test`)
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// ── Browser globals shimmed for Node ────────────────────────────────────────

let store: Record<string, string> = {};
const localStorageShim = {
  getItem: (k: string) => store[k] ?? null,
  setItem: (k: string, v: string) => { store[k] = v; },
  removeItem: (k: string) => { delete store[k]; },
  clear: () => { store = {}; },
  length: 0,
  key: (_: number) => null,
};
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageShim,
  configurable: true,
  writable: true,
});

Object.defineProperty(globalThis, 'window', {
  value: { innerWidth: 1280, location: { pathname: '/test' } },
  configurable: true,
  writable: true,
});

Object.defineProperty(globalThis, 'document', {
  value: { referrer: '' },
  configurable: true,
  writable: true,
});

Object.defineProperty(globalThis, 'crypto', {
  value: { randomUUID: () => 'test-uuid-1234' },
  configurable: true,
  writable: true,
});

// ── fetch spy ───────────────────────────────────────────────────────────────

let fetchCallCount = 0;
function resetFetchSpy() { fetchCallCount = 0; }

Object.defineProperty(globalThis, 'fetch', {
  value: (_url: string, _init?: RequestInit) => {
    fetchCallCount++;
    return Promise.resolve(new Response('{}', { status: 200 }));
  },
  configurable: true,
  writable: true,
});

// ── Import the module under test ─────────────────────────────────────────────

const { firePageViewBeacon, hasConsent, CONSENT_KEY } = await import('./analytics-core.ts');

// ── Coupling guard: the settings dialog must write the key analytics reads ────
// cookie-consent.tsx imports React / path aliases so Node can't load it, but we
// can still confirm its STORAGE_KEY literal matches analytics' CONSENT_KEY. If
// these ever drift, the whole in-session flow silently breaks.
const consentSource = readFileSync(
  new URL('../components/cookie-consent.tsx', import.meta.url),
  'utf8',
);
const keyMatch = consentSource.match(/STORAGE_KEY\s*=\s*'([^']+)'/);
assert.ok(keyMatch, 'cookie-consent.tsx must declare a STORAGE_KEY string literal');
assert.equal(
  keyMatch![1],
  CONSENT_KEY,
  'cookie-consent STORAGE_KEY must equal analytics-core CONSENT_KEY (else settings changes never reach the beacon)',
);

// Model the dialog's respond() side-effect exactly (see cookie-consent.tsx).
// This is the only state the settings dialog changes — no reload, no reset.
function respondViaSettings(value: 'accepted' | 'declined') {
  localStorage.setItem(keyMatch![1], value);
}

// ── Scenario 1: accept → decline in-session suppresses analytics ─────────────

store = {};
resetFetchSpy();

// Visitor accepts on the banner, then navigates → beacon fires.
respondViaSettings('accepted');
assert.equal(hasConsent(), true, 'consent should read accepted after the visitor accepts');
const firedAfterAccept = firePageViewBeacon('/page-1', 'en');
assert.equal(firedAfterAccept, true, 'beacon must fire on navigation while accepted');
assert.equal(fetchCallCount, 1, 'exactly one beacon after accept + navigate');

// Visitor opens Cookie settings and switches to Decline — SAME session, no reload.
respondViaSettings('declined');
assert.equal(hasConsent(), false, 'consent must immediately read declined after the in-session change');

// Any subsequent navigation must NOT fire analytics.
const firedAfterDecline = firePageViewBeacon('/page-2', 'en');
assert.equal(firedAfterDecline, false, 'beacon must be suppressed after in-session decline (no reload)');
assert.equal(fetchCallCount, 1, 'no new beacon fires after switching to decline');

// A further navigation still stays suppressed.
firePageViewBeacon('/page-3', 'nl');
assert.equal(fetchCallCount, 1, 'analytics stays off for every navigation while declined');

// ── Scenario 2: decline → accept in-session resumes analytics ────────────────

store = {};
resetFetchSpy();

// Visitor declines first, then navigates → no beacon.
respondViaSettings('declined');
const firedWhileDeclined = firePageViewBeacon('/page-4', 'en');
assert.equal(firedWhileDeclined, false, 'beacon must not fire while declined');
assert.equal(fetchCallCount, 0, 'no beacon while declined');

// Visitor opens Cookie settings and switches to Accept — SAME session, no reload.
respondViaSettings('accepted');
assert.equal(hasConsent(), true, 'consent must immediately read accepted after the in-session change');

// Navigation now fires analytics again.
const firedAfterReaccept = firePageViewBeacon('/page-5', 'en');
assert.equal(firedAfterReaccept, true, 'beacon must resume firing after in-session accept (no reload)');
assert.equal(fetchCallCount, 1, 'analytics resumes exactly one beacon after re-accepting');

console.log('use-analytics-consent-change: all in-session consent-change assertions passed ✓');
