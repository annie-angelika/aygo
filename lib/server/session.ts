// Guest sessions: every browser gets a stable anonymous id, stored in an
// HMAC-signed, httpOnly cookie. There's no password — the signature just proves
// the id was issued by us (so it can't be forged to read another guest's data).
// This identifies the user behind every `/me/*` route.
//
// Accounts: a login is verified SERVER-SIDE (lib/server/pollar.ts), and the
// verified identity maps to ONE session id in the store's `accounts` table —
// so signing in on a second device, or after clearing cookies, restores the
// same events, RSVPs, stamps and inbox. Signing in as account A on a browser
// that was anonymous adopts that browser's id for A (a guest who signs up
// keeps what they did before); on a browser already holding another account's
// id a fresh id is minted, so two people sharing a device never bleed into
// each other. Signing out rotates to a fresh anonymous id.

import "server-only";
import { cookies } from "next/headers";
import { createHmac, randomUUID, timingSafeEqual } from "crypto";
import { SESSION_SECRET } from "@/lib/server/env";
import { getStore } from "@/lib/server/store";

const COOKIE = "aygo_session";
/** A browser cookie from the retired per-browser account map — cleared on sight. */
const LEGACY_ACCOUNTS_COOKIE = "aygo_accounts";
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

/**
 * Make the session cookie carry the id that belongs to `accountKey` (a hash of
 * a server-verified identity): the account's stored id when it has one, else
 * the current id — unless that id already belongs to another account, in
 * which case a fresh id is minted and bound. Returns whether the active id
 * changed (the client reloads then) and the id now in force.
 */
export async function switchToAccount(
  accountKey: string,
): Promise<{ changed: boolean; sid: string }> {
  const cookieStore = await cookies();
  if (cookieStore.get(LEGACY_ACCOUNTS_COOKIE)) cookieStore.delete(LEGACY_ACCOUNTS_COOKIE);
  const current = await getSessionId();
  const store = getStore();

  const remembered = await store.getAccountSession(accountKey);
  if (remembered) {
    if (remembered !== current) setSession(cookieStore, remembered);
    return { changed: remembered !== current, sid: remembered };
  }

  const takenByOther = (await store.getSessionAccount(current)) !== null;
  const sid = takenByOther ? randomUUID() : current;
  await store.bindAccount(accountKey, sid);
  // Two devices signing up the same account at once: whichever bind landed
  // first wins, and this one adopts it.
  const bound = (await store.getAccountSession(accountKey)) ?? sid;
  if (bound !== current) setSession(cookieStore, bound);
  return { changed: bound !== current, sid: bound };
}

/** Sign out: rotate to a fresh anonymous id (the account's own id stays bound to it). */
export async function resetSession(): Promise<{ changed: boolean }> {
  const cookieStore = await cookies();
  if (cookieStore.get(LEGACY_ACCOUNTS_COOKIE)) cookieStore.delete(LEGACY_ACCOUNTS_COOKIE);
  const current = currentId(cookieStore);
  // Only rotate when the current id is an account's — an anonymous browser
  // signing out of nothing keeps its state.
  if (!current || (await getStore().getSessionAccount(current)) === null)
    return { changed: false };
  setSession(cookieStore, randomUUID());
  return { changed: true };
}
