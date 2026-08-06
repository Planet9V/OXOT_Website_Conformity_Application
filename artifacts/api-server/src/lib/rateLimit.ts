import type { Request } from "express";

/**
 * Simple in-memory fixed-window rate limiter.
 *
 * NOTE: This limiter is IN-MEMORY only — its counters live in the current
 * process and are LOST on every restart/redeploy, and are NOT shared across
 * multiple instances. That is acceptable for basic spam/cost protection here;
 * durable, cross-instance rate limiting is tracked separately (task #17).
 *
 * This is intended as the shared rate-limiting util for public endpoints
 * (newsletter signup, AI assistant chat, etc.) so behaviour stays consistent.
 */

export interface RateLimitOptions {
  /** Length of the sliding/fixed window in milliseconds. */
  windowMs: number;
  /** Maximum number of allowed hits per key within the window. */
  max: number;
}

export interface RateLimitResult {
  /** True when the request is within the allowed budget. */
  allowed: boolean;
  /** Remaining hits in the current window (never negative). */
  remaining: number;
  /** Seconds until the current window resets (useful for Retry-After). */
  retryAfterSeconds: number;
}

interface Bucket {
  count: number;
  /** Epoch ms when the current window expires. */
  resetAt: number;
}

/**
 * Hard cap on the number of distinct keys we track at once. This bounds memory
 * even under deliberate key churn (e.g. an attacker rotating identifiers). When
 * the cap is exceeded we evict the least-recently-used entries first.
 */
const MAX_BUCKETS = 10_000;

export class RateLimiter {
  private readonly windowMs: number;
  private readonly max: number;
  private readonly maxBuckets: number;
  // Map preserves insertion order; we exploit that for a cheap LRU: on access
  // we re-insert the key so the oldest (least-recently-used) is evicted first.
  private readonly buckets = new Map<string, Bucket>();
  private lastSweep = 0;

  constructor(options: RateLimitOptions & { maxBuckets?: number }) {
    this.windowMs = options.windowMs;
    this.max = options.max;
    this.maxBuckets = options.maxBuckets ?? MAX_BUCKETS;
  }

  /** Records a hit for `key` and reports whether it is allowed. */
  hit(key: string, now = Date.now()): RateLimitResult {
    this.maybeSweep(now);
    let bucket = this.buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + this.windowMs };
    } else {
      // Refresh recency: delete + re-insert so this key moves to the newest
      // position in insertion order for LRU eviction below.
      this.buckets.delete(key);
    }
    this.buckets.set(key, bucket);
    this.enforceCap();
    bucket.count += 1;
    const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    if (bucket.count > this.max) {
      return { allowed: false, remaining: 0, retryAfterSeconds };
    }
    return {
      allowed: true,
      remaining: Math.max(0, this.max - bucket.count),
      retryAfterSeconds,
    };
  }

  /** Periodically drops expired buckets so the map cannot grow unbounded. */
  private maybeSweep(now: number): void {
    if (now - this.lastSweep < this.windowMs) return;
    this.lastSweep = now;
    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt <= now) this.buckets.delete(key);
    }
  }

  /**
   * Enforces the hard bucket cap: if the map has grown past the limit, evict
   * the oldest (least-recently-used) entries. This guarantees bounded memory
   * even if many distinct keys arrive within a single window.
   */
  private enforceCap(): void {
    while (this.buckets.size > this.maxBuckets) {
      const oldest = this.buckets.keys().next().value;
      if (oldest === undefined) break;
      this.buckets.delete(oldest);
    }
  }
}

/**
 * Derive a TRUSTED client IP for a public request. We take the leftmost
 * (original client) hop from X-Forwarded-For when present, otherwise fall back
 * to Express's resolved `req.ip` / socket address. This mirrors how the rest of
 * the server treats client IP and, crucially, does NOT trust a client-supplied
 * identity header.
 */
function trustedClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  const rawForwarded = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  if (rawForwarded) {
    const first = rawForwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.ip ?? req.socket?.remoteAddress ?? "unknown";
}

/**
 * Client key for a public request. The key is ALWAYS anchored to the trusted
 * client IP so a client-controlled value (e.g. a rotating X-Session-Id header)
 * can never define the key on its own and evade limits. An optional session id
 * only adds per-session granularity WITHIN that IP's budget — rotating it keeps
 * the attacker inside the same IP bucket.
 */
export function clientKey(req: Request, sessionId?: string | null): string {
  const ip = trustedClientIp(req);
  if (sessionId && sessionId.length > 0) return `ip:${ip}|sess:${sessionId}`;
  return `ip:${ip}`;
}
