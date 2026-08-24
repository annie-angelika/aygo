// Guest sessions: every browser gets a stable anonymous id, stored in an
// HMAC-signed, httpOnly cookie. There's no password — the signature just proves
// the id was issued by us (so it can't be forged to read another guest's data).
// This identifies the user behind every `/me/*` route.
//
// Accounts: Pollar's login is client-side and its tokens are DPoP-bound, so the
// server can't verify them directly. What we CAN do is keep one session id PER
// ACCOUNT PER BROWSER: a second signed cookie maps `account key → session id`.
// Signing in as account A restores A's id; signing in as B on the same browser
// gets B's own id; signing out rotates to a fresh anonymous id. So ownership,
// RSVPs and inboxes never bleed between two accounts sharing a device. The
// trust boundary is unchanged (possession of this browser's cookies).

import "server-only";
import { cookies } from "next/headers";
import { createHmac, randomUUID, timingSafeEqual } from "crypto";
import { SESSION_SECRET } from "@/lib/server/env";

const COOKIE = "aygo_session";
const ACCOUNTS_COOKIE = "aygo_accounts";
const MAX_AGE = 60 * 60 * 24 * 365; // 1 year
/** How many accounts one browser remembers (oldest dropped first). */
const MAX_ACCOUNTS = 8;

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

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE,
} as const;

type CookieStore = Awaited<ReturnType<typeof cookies>>;

function setSession(store: CookieStore, id: string): void {
  store.set(COOKIE, `${id}.${sign(id)}`, COOKIE_OPTS);
}

/** The verified id in the session cookie, or null when absent/tampered. */
function currentId(store: CookieStore): string | null {
  const existing = store.get(COOKIE)?.value;
  return existing ? verify(existing) : null;
}

/**
 * The current guest's id, minting and persisting a new one on first visit.
 * Must run in a Route Handler (it may set a cookie on the outgoing response).
 */
export async function getSessionId(): Promise<string> {
  const store = await cookies();
  const id = currentId(store);
  if (id) return id;
  const fresh = randomUUID();
  setSession(store, fresh);
  return fresh;
}

// --- Account ↔ session map (second signed cookie) ---

/** Parse the signed `account → id` map; tampering yields an empty map. */
function readAccounts(store: CookieStore): Record<string, string> {
  const raw = store.get(ACCOUNTS_COOKIE)?.value;
  if (!raw) return {};
  const payload = verify(raw);
  if (!payload) return {};
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString());
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeAccounts(store: CookieStore, map: Record<string, string>): void {
  const entries = Object.entries(map).slice(-MAX_ACCOUNTS);
  const payload = Buffer.from(JSON.stringify(Object.fromEntries(entries))).toString(
    "base64url",
  );
  store.set(ACCOUNTS_COOKIE, `${payload}.${sign(payload)}`, COOKIE_OPTS);
}

/**
 * Make the session cookie carry the id that belongs to `accountKey` on this
 * browser: the remembered one, or — for an account never seen here — the
 * current id (so an anonymous browse that just signed up keeps its RSVPs),
 * unless that id already belongs to another account, in which case a fresh id
 * is minted. Returns whether the active id changed (the client reloads then).
 */
export async function switchToAccount(
  accountKey: string,
): Promise<{ changed: boolean; sid: string }> {
  const store = await cookies();
  const current = await getSessionId();
  const map = readAccounts(store);
  const remembered = map[accountKey];
  if (remembered) {
    if (remembered !== current) setSession(store, remembered);
    return { changed: remembered !== current, sid: remembered };
  }
  const takenByOther = Object.values(map).includes(current);
  const sid = takenByOther ? randomUUID() : current;
  map[accountKey] = sid;
  writeAccounts(store, map);
  if (sid !== current) setSession(store, sid);
  return { changed: sid !== current, sid };
}

/** Sign out: rotate to a fresh anonymous id (the account's own id stays remembered). */
export async function resetSession(): Promise<{ changed: boolean }> {
  const store = await cookies();
  const current = currentId(store);
  const map = readAccounts(store);
  // Only rotate when the current id is an account's — an anonymous browser
  // signing out of nothing keeps its state.
  if (!current || !Object.values(map).includes(current)) return { changed: false };
  setSession(store, randomUUID());
  return { changed: true };
}
