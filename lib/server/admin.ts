// Admin authorization. The admin key (AYGO_ADMIN_TOKEN) is the security
// boundary: the dashboard exchanges it once (POST /api/admin/session) for a
// signed, httpOnly cookie, so the key itself never sits in browser storage.
// Server routes accept either the cookie (dashboard) or the raw key in the
// `x-admin-token` header (scripts / curl). The cookie payload is prefixed with
// "admin:" before signing so a guest-session cookie can never be replayed here.

import "server-only";
import { cookies } from "next/headers";
import { createHmac, randomUUID, timingSafeEqual } from "crypto";
import { ADMIN_TOKEN, SESSION_SECRET } from "@/lib/server/env";
import { HttpError } from "@/lib/server/http";

const COOKIE = "aygo_admin";
const MAX_AGE = 60 * 60 * 12; // 12h — an admin session, not a login

const sign = (id: string) =>
  createHmac("sha256", SESSION_SECRET).update(`admin:${id}`).digest("base64url");

function constantTimeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

/** True when the raw admin key matches (constant-time; false if unconfigured). */
export function isValidAdminKey(key: string): boolean {
  return Boolean(ADMIN_TOKEN) && constantTimeEqual(key, ADMIN_TOKEN);
}

/** Mint the admin cookie after a successful key exchange. */
export async function grantAdmin(): Promise<void> {
  const id = randomUUID();
  (await cookies()).set(COOKIE, `${id}.${sign(id)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function revokeAdmin(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

/** True when the request carries a valid admin cookie. */
export async function hasAdminCookie(): Promise<boolean> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return false;
  const dot = token.lastIndexOf(".");
  if (dot < 0) return false;
  return constantTimeEqual(token.slice(dot + 1), sign(token.slice(0, dot)));
}

/** Gate an admin route: valid cookie, or the raw key in `x-admin-token`. */
export async function requireAdmin(req: Request): Promise<void> {
  if (!ADMIN_TOKEN) {
    throw new HttpError(500, "AYGO_ADMIN_TOKEN is not configured");
  }
  const header = req.headers.get("x-admin-token");
  if (header && isValidAdminKey(header)) return;
  if (await hasAdminCookie()) return;
  throw new HttpError(401, "Admin authorization required");
}
