// Server-only environment access. Centralizes every backend env var (see
// `.env.example`) so the rest of the server reads typed values, never
// `process.env` directly. Importing this from client code would leak secrets —
// it's only ever pulled in by route handlers and the store layer.

import "server-only";

/** Where the data lives. Defaults to the in-process mock store. */
export type DataSource = "memory" | "postgres";

export const DATA_SOURCE: DataSource =
  process.env.AYGO_DATA_SOURCE === "postgres" ? "postgres" : "memory";

/**
 * Which deployment this is, from Vercel ("production" | "preview" |
 * "development") or `AYGO_ENV` when running elsewhere. Each environment must
 * point at its OWN Neon branch (see .env.example → "Databases per
 * environment"): production at `production`, everything else at `dev` or a
 * per-preview branch. The guards below make a misconfiguration fail loudly
 * at boot instead of quietly mixing test data into production.
 */
export const APP_ENV = process.env.VERCEL_ENV ?? process.env.AYGO_ENV ?? "development";
// NODE_ENV is deliberately NOT consulted: a local `next build` runs with
// NODE_ENV=production against .env.local (the dev branch) and must not trip
// the production guard. Off Vercel, set AYGO_ENV=production on the real host.

if (APP_ENV === "production") {
  if (DATA_SOURCE !== "postgres")
    throw new Error("Production must run with AYGO_DATA_SOURCE=postgres (a real database)");
  // A dev branch marked as such in its own env (AYGO_DB_BRANCH=dev) can never
  // be wired into the production deployment by mistake.
  if (process.env.AYGO_DB_BRANCH && process.env.AYGO_DB_BRANCH !== "production")
    throw new Error(
      `Production is pointing at the "${process.env.AYGO_DB_BRANCH}" database branch — fix DATABASE_URL/AYGO_DB_BRANCH in the Vercel Production environment`,
    );
} else if (process.env.AYGO_DB_BRANCH === "production" && process.env.AYGO_ALLOW_PROD_DB !== "1") {
  // Local dev / previews against the production branch would write test data
  // into real users' inboxes. Opt in explicitly if you really need to.
  throw new Error(
    'This environment is pointing at the "production" database branch. Use the dev branch (see .env.example), or set AYGO_ALLOW_PROD_DB=1 on purpose.',
  );
}

/** Postgres connection string. Required when DATA_SOURCE === "postgres". */
export const DATABASE_URL = process.env.DATABASE_URL ?? "";

/**
 * Secret signing the guest-session cookie. In development we fall back to a
 * fixed insecure value so the app runs with zero setup; in production an unset
 * secret is a hard error (sessions would be forgeable).
 */
export const SESSION_SECRET = (() => {
  const secret = process.env.AYGO_SESSION_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("AYGO_SESSION_SECRET is required in production");
  }
  return "dev-insecure-session-secret-do-not-use-in-prod";
})();

/** Token guarding `POST /api/admin/seed` (sent as the `x-admin-token` header). */
export const ADMIN_TOKEN = process.env.AYGO_ADMIN_TOKEN ?? "";

/** Origins allowed to call `/api` cross-origin from a browser (CORS allowlist). */
export const CORS_ORIGINS = (process.env.AYGO_CORS_ORIGINS ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
