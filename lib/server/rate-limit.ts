// Per-process sliding-window rate limits for write endpoints, keyed by the
// caller's session AND by their IP (so a script rotating cookies is still
// capped, and a shared office IP isn't blocked by one bad session alone —
// both limits must hold). State lives on globalThis so dev hot-reloads keep
// it; on a multi-instance deployment each instance enforces its own window,
// which still bounds abuse to N × instances. Durable caps (events per day,
// threads per event) are enforced against the store in the routes.

import "server-only";
import { HttpError } from "@/lib/server/http";

type Bucket = number[]; // timestamps (ms) of recent hits
const g = globalThis as unknown as { __aygoRate?: Map<string, Bucket> };
const buckets: Map<string, Bucket> = (g.__aygoRate ??= new Map<string, Bucket>());

let lastSweep = 0;
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [k, hits] of buckets)
    if (hits.length === 0 || now - hits[hits.length - 1] > 3_600_000) buckets.delete(k);
}

export type Limit = { max: number; windowMs: number };

/** The caller's IP as seen behind Vercel's proxy (first x-forwarded-for hop). */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  const ip = xff?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
  return ip.slice(0, 64);
}

function hit(key: string, limit: Limit, now: number): boolean {
  const hits = buckets.get(key) ?? [];
  const fresh = hits.filter((t) => now - t < limit.windowMs);
  if (fresh.length >= limit.max) {
    buckets.set(key, fresh);
    return false;
  }
  fresh.push(now);
  buckets.set(key, fresh);
  return true;
}

/**
 * Enforce `limit` for this action on both the session and the IP. Throws 429
 * with a plain message when either window is full.
 */
export function rateLimit(
  req: Request,
  action: string,
  sid: string | null,
  limit: Limit,
  ipLimit: Limit = { max: limit.max * 4, windowMs: limit.windowMs },
): void {
  const now = Date.now();
  sweep(now);
  const ip = clientIp(req);
  const okSid = sid ? hit(`${action}:s:${sid}`, limit, now) : true;
  const okIp = hit(`${action}:ip:${ip}`, ipLimit, now);
  if (!okSid || !okIp)
    throw new HttpError(429, "Too many requests — slow down and try again in a bit.");
}

// Named budgets so the numbers live in one place.
export const LIMITS = {
  // Attempts, not successes (so probing the validator is capped too); the
  // durable 10/day + lifetime caps live in the events route.
  createEvent: { max: 12, windowMs: 60 * 60_000 },
  editEvent: { max: 30, windowMs: 60 * 60_000 },
  register: { max: 30, windowMs: 60 * 60_000 },
  feedback: { max: 10, windowMs: 60 * 60_000 },
  reply: { max: 30, windowMs: 60 * 60_000 },
  profile: { max: 20, windowMs: 60 * 60_000 },
  usernameCheck: { max: 60, windowMs: 60_000 },
  preferences: { max: 60, windowMs: 60 * 60_000 },
  session: { max: 20, windowMs: 10 * 60_000 },
  stamps: { max: 20, windowMs: 60 * 60_000 },
  geocode: { max: 30, windowMs: 60_000 },
  adminLogin: { max: 5, windowMs: 15 * 60_000 },
  hostAction: { max: 120, windowMs: 60 * 60_000 },
} as const satisfies Record<string, Limit>;
