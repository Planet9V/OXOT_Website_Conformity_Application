/**
 * Regression guard: analytics beacon must NOT fire when the visitor has
 * declined (or not yet answered) the cookie consent banner, and MUST fire
 * when the visitor has accepted.
 *
 * Self-contained assertion script — no test framework required.
 * Run with: node --experimental-strip-types use-analytics.test.ts
 * (wired via `pnpm --filter @workspace/oxot-web test`)
 */
import assert from 'node:assert/strict';

// ── Browser globals shimmed for Node ────────────────────────────────────────

// Minimal localStorage backed by a plain object.
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

// Minimal window shim (innerWidth used by getDevice, location.pathname used by the hook).
Object.defineProperty(globalThis, 'window', {
  value: { innerWidth: 1280, location: { pathname: '/test' } },
  configurable: true,
  writable: true,
});

// Minimal document shim.
Object.defineProperty(globalThis, 'document', {
  value: { referrer: '' },
  configurable: true,
  writable: true,
});

// crypto.randomUUID shim.
Object.defineProperty(globalThis, 'crypto', {
  value: { randomUUID: () => 'test-uuid-1234' },
  configurable: true,
  writable: true,
});

// ── fetch spy ───────────────────────────────────────────────────────────────

let fetchCallCount = 0;
let lastFetchUrl: string | undefined;
let lastFetchBody: unknown;

function resetFetchSpy() {
  fetchCallCount = 0;
  lastFetchUrl = undefined;
  lastFetchBody = undefined;
}

Object.defineProperty(globalThis, 'fetch', {
  value: (url: string, init?: RequestInit) => {
    fetchCallCount++;
    lastFetchUrl = url;
    try { lastFetchBody = JSON.parse(init?.body as string); } catch { lastFetchBody = init?.body; }
    return Promise.resolve(new Response('{}', { status: 200 }));
  },
  configurable: true,
  writable: true,
});

// ── Import the module under test ─────────────────────────────────────────────
// analytics-core.ts has no React / path-alias imports so Node can load it directly.
const { hasConsent, firePageViewBeacon, CONSENT_KEY } = await import('./analytics-core.ts');

// ── hasConsent() tests ───────────────────────────────────────────────────────

// No entry in localStorage → not consented.
store = {};
assert.equal(hasConsent(), false, 'hasConsent() must return false when key is absent');

// Explicitly declined.
store = { [CONSENT_KEY]: 'declined' };
assert.equal(hasConsent(), false, 'hasConsent() must return false when value is "declined"');

// Accepted.
store = { [CONSENT_KEY]: 'accepted' };
assert.equal(hasConsent(), true, 'hasConsent() must return true when value is "accepted"');

// ── firePageViewBeacon(): declined → no fetch ────────────────────────────────

store = { [CONSENT_KEY]: 'declined' };
resetFetchSpy();
const firedDeclined = firePageViewBeacon('/some-page', 'en');
assert.equal(firedDeclined, false, 'firePageViewBeacon must return false when consent is declined');
assert.equal(fetchCallCount, 0, 'fetch must NOT be called when consent is declined');

// ── firePageViewBeacon(): absent → no fetch ──────────────────────────────────

store = {};
resetFetchSpy();
const firedAbsent = firePageViewBeacon('/some-page', 'en');
assert.equal(firedAbsent, false, 'firePageViewBeacon must return false when consent is absent');
assert.equal(fetchCallCount, 0, 'fetch must NOT be called when consent is absent');

// ── firePageViewBeacon(): accepted → fetch fires ─────────────────────────────

store = { [CONSENT_KEY]: 'accepted' };
resetFetchSpy();
const firedAccepted = firePageViewBeacon('/some-page', 'en');
assert.equal(firedAccepted, true, 'firePageViewBeacon must return true when consent is accepted');
assert.equal(fetchCallCount, 1, 'fetch must be called exactly once when consent is accepted');
assert.equal(lastFetchUrl, '/api/analytics/collect', 'beacon must POST to /api/analytics/collect');

// Verify payload shape.
const body = lastFetchBody as Record<string, unknown>;
assert.equal(body.path, '/some-page', 'payload must include the path passed to firePageViewBeacon');
assert.equal(body.locale, 'en', 'payload must include the locale');
assert.ok(typeof body.sessionId === 'string' && body.sessionId.length > 0, 'payload must include a non-empty sessionId');
assert.equal(body.device, 'desktop', 'payload must include device type');

// ── Multiple calls with accepted consent all fire ────────────────────────────

store = { [CONSENT_KEY]: 'accepted' };
resetFetchSpy();
firePageViewBeacon('/page-a', 'nl');
firePageViewBeacon('/page-b', 'en');
assert.equal(fetchCallCount, 2, 'each firePageViewBeacon call sends its own beacon when consent is accepted');

console.log('use-analytics: all 13 consent-gate assertions passed ✓');
