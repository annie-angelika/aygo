// Access code for the dev deployment (dev.aygo.app). When AYGO_DEV_ACCESS_CODE
// is set — only in the Vercel "Preview" environment — the proxy turns every
// page and API request away until the browser holds the `aygo_dev` cookie,
// which /dev-access (or a `?code=` link) issues after checking the code.
//
// Production is exempt no matter what: even if the variable leaks into the
// Production environment by mistake, aygo.app never locks out real users.
//
// NOTE: this module is imported by `proxy.ts`, so it must stay free of
// `server-only` (that package throws outside React Server bundles) and of
// anything heavier than the Web Crypto API.

export const DEV_ACCESS_COOKIE = "aygo_dev";

const CODE =
  process.env.VERCEL_ENV === "production" ? "" : (process.env.AYGO_DEV_ACCESS_CODE ?? "");

/** Whether this deployment is gated behind the dev access code. */
export const DEV_GATE_ENABLED = CODE.length > 0;

/** True on Vercel preview deployments (dev.aygo.app and per-branch URLs). */
export const IS_PREVIEW = process.env.VERCEL_ENV === "preview";

export const DEV_ACCESS_COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax",
  secure: true,
  path: "/",
  maxAge: 60 * 60 * 24 * 30, // 30 days
} as const;

/**
 * The cookie value that proves the code was entered: a hash of the code, so
 * the cookie never carries the code itself and rotating the code invalidates
 * every cookie issued for the old one.
 */
async function tokenFor(code: string): Promise<string> {
  const bytes = new TextEncoder().encode(`aygo-dev-access:${code}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

function equal(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** The token a browser must present in `aygo_dev`. */
export function devAccessToken(): Promise<string> {
  return tokenFor(CODE);
}

/** Whether `cookie` (the `aygo_dev` value) unlocks this deployment. */
export async function hasDevAccess(cookie: string | undefined): Promise<boolean> {
  if (!DEV_GATE_ENABLED || !cookie) return false;
  return equal(cookie, await devAccessToken());
}

/** Whether a code typed by the user (or passed as `?code=`) is the right one. */
export async function verifyDevCode(code: string): Promise<boolean> {
  if (!DEV_GATE_ENABLED) return false;
  return equal(await tokenFor(code.trim()), await devAccessToken());
}

/**
 * Where to send the user after unlocking. Only same-site paths are honoured,
 * so the `next` param can't be turned into an open redirect.
 */
export function safeNext(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return "/";
  return next;
}
