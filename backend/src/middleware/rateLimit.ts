import type { MiddlewareHandler } from "hono";
import { getClientIp } from "../lib/getClientIp";

interface RateLimitOptions {
  max: number;
  windowMs: number;
}

const buckets = new Map<string, number[]>();

export function rateLimit(opts: RateLimitOptions): MiddlewareHandler {
  return async (c, next) => {
    const ip = getClientIp(c);
    const key = `${c.req.path}|${ip}`;
    const now = Date.now();
    const cutoff = now - opts.windowMs;

    const timestamps = (buckets.get(key) ?? []).filter((t) => t > cutoff);

    if (timestamps.length >= opts.max) {
      return c.json(
        {
          error: "Too many requests",
          code: "RATE_LIMITED",
          retryAfterMs: opts.windowMs,
        },
        429
      );
    }

    timestamps.push(now);
    buckets.set(key, timestamps);
    await next();
  };
}

export function _resetRateLimit() {
  buckets.clear();
}
