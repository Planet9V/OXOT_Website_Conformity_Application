import type { Request, RequestHandler } from "express";

/**
 * Lightweight in-memory fixed-window rate limiter.
 *
 * Designed to be reused by any public endpoint that needs abuse protection
 * (e.g. the newsletter signup, and later the AI assistant). It keeps counters
 * in process memory — good enough for a single instance and for deterring
 * bursty abuse. If the app is ever scaled horizontally this should be backed
 * by a shared store, but the calling contract would stay the same.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

export interface RateLimitOptions {
  /** Length of the counting window, in milliseconds. */
  windowMs: number;
  /** Maximum number of allowed requests per key within the window. */
  max: number;
  /** Namespace so multiple limiters can share the same key space safely. */
  keyPrefix: string;
  /**
   * Derives the per-request key (e.g. client IP or normalized email).
   * Return `null`/`undefined` to skip limiting for this request.
   * Defaults to the client IP.
   */
  keyGenerator?: (req: Request) => string | null | undefined;
  /** Message returned in the 429 body. */
  message?: string;
}

export function rateLimit(options: RateLimitOptions): RequestHandler {
  const {
    windowMs,
    max,
    keyPrefix,
    keyGenerator = (req) => req.ip ?? null,
    message = "Too many requests. Please slow down and try again later.",
  } = options;

  const buckets = new Map<string, Bucket>();

  // Periodically evict expired buckets so memory stays bounded even under a
  // flood of unique keys (e.g. spoofed IPs / random emails).
  const sweep = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
  }, windowMs);
  sweep.unref?.();

  return (req, res, next) => {
    const subject = keyGenerator(req);
    if (subject == null || subject === "") {
      next();
      return;
    }

    const key = `${keyPrefix}:${subject}`;
    const now = Date.now();
    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }
    bucket.count += 1;

    const remaining = Math.max(0, max - bucket.count);
    const resetSeconds = Math.ceil((bucket.resetAt - now) / 1000);
    res.setHeader("RateLimit-Limit", String(max));
    res.setHeader("RateLimit-Remaining", String(remaining));
    res.setHeader("RateLimit-Reset", String(resetSeconds));

    if (bucket.count > max) {
      res.setHeader("Retry-After", String(resetSeconds));
      req.log.warn(
        { keyPrefix, retryAfterSeconds: resetSeconds },
        "Rate limit exceeded",
      );
      res.status(429).json({ error: message });
      return;
    }

    next();
  };
}
