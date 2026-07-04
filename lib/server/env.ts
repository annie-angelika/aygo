// Server-only environment access. Centralizes every backend env var (see
// `.env.example`) so the rest of the server reads typed values, never
// `process.env` directly. Importing this from client code would leak secrets —
// it's only ever pulled in by route handlers and the store layer.

import "server-only";

/** Where the data lives. Defaults to the in-process mock store. */
export type DataSource = "memory" | "postgres";

export const DATA_SOURCE: DataSource =
  process.env.AYGO_DATA_SOURCE === "postgres" ? "postgres" : "memory";

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
