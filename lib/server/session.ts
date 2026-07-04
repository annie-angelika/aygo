// Guest sessions: every browser gets a stable anonymous id, stored in an
// HMAC-signed, httpOnly cookie. There's no password — the signature just proves
// the id was issued by us (so it can't be forged to read another guest's data).
// This identifies the user behind every `/me/*` route. Social login (Pollar) is
// a separate, client-side concern and can later be linked to this guest id.

import "server-only";
import { cookies } from "next/headers";
import { createHmac, randomUUID, timingSafeEqual } from "crypto";
import { SESSION_SECRET } from "@/lib/server/env";

const COOKIE = "aygo_session";
const MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function sign(id: string): string {
  return createHmac("sha256", SESSION_SECRET).update(id).digest("base64url");
}

/** `id.signature`, verified constant-time. Returns the id, or null if tampered. */
function verify(token: string): string | null {
  const dot = token.lastIndexOf(".");
  if (dot < 0) return null;
  const id = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = sign(id);
  // Constant-time compare; bail if lengths differ (timingSafeEqual throws).
  if (sig.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  return id;
}

/**
 * The current guest's id, minting and persisting a new one on first visit.
 * Must run in a Route Handler (it may set a cookie on the outgoing response).
 */
export async function getSessionId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(COOKIE)?.value;
  if (existing) {
    const id = verify(existing);
    if (id) return id;
  }

  const id = randomUUID();
  store.set(COOKIE, `${id}.${sign(id)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
  return id;
}
