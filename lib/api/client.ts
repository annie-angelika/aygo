/**
 * The single seam between the app and its backend.
 *
 * Every `lib/api/*` module talks to the server *only* through `api.get/post/…`.
 * That keeps the network surface — base URL, auth header, JSON encoding, error
 * shape, credentials — in one auditable place, so wiring a real backend never
 * touches feature code.
 *
 * The backend is this app's own route handlers under `/api` (see `app/api`).
 * `NEXT_PUBLIC_API_URL` only needs setting to point at another host.
 */

/** Base URL for the API. Defaults to the same-origin `/api` route handlers. */
const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "/api";

/** A non-2xx response. Carries the HTTP status and parsed body for the caller. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// --- Auth -------------------------------------------------------------------
// The session is a signed cookie (see AYGO_SESSION_SECRET), sent automatically
// via `credentials: "include"`. For token-based auth (e.g. a Pollar JWT), set it
// once after login and it rides on every request as `Authorization: Bearer …`.
//
// IMPORTANT: `setAuthToken` is for the BROWSER only — the token is module-level,
// so calling it on the server would share one identity across all requests. By
// design every authenticated call (`/me/*`) is made from a Client Component
// hook; server-side usage is limited to public catalog reads (events, etc.),
// which need no auth. If a server route ever needs the user, forward the
// incoming cookies per-request instead of using this.

let authToken: string | null = null;

/** Set (or clear, with `null`) the bearer token sent on every request. */
export function setAuthToken(token: string | null): void {
  authToken = token;
}

type QueryValue = string | number | boolean | null | undefined;
type Query = Record<string, QueryValue>;

function buildUrl(path: string, query?: Query): string {
  const url = `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value != null) params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

type RequestOptions = {
  query?: Query;
  body?: unknown;
  /** Pass an AbortController signal so callers can cancel in-flight requests. */
  signal?: AbortSignal;
};

async function request<T>(
  method: string,
  path: string,
  { query, body, signal }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

  const res = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
    credentials: "include", // send the session cookie
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => undefined);
    const message =
      (errorBody && typeof errorBody === "object" && "message" in errorBody
        ? String((errorBody as { message: unknown }).message)
        : null) ?? `Request failed: ${res.status} ${res.statusText}`;
    throw new ApiError(res.status, message, errorBody);
  }

  // 204 No Content (e.g. a successful sync with no payload).
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/** Thin verb helpers over `request`. Use these from `lib/api/*` modules only. */
export const api = {
  get: <T>(path: string, query?: Query, signal?: AbortSignal) =>
    request<T>("GET", path, { query, signal }),
  post: <T>(path: string, body?: unknown, signal?: AbortSignal) =>
    request<T>("POST", path, { body, signal }),
  put: <T>(path: string, body?: unknown, signal?: AbortSignal) =>
    request<T>("PUT", path, { body, signal }),
  patch: <T>(path: string, body?: unknown, signal?: AbortSignal) =>
    request<T>("PATCH", path, { body, signal }),
  delete: <T>(path: string, signal?: AbortSignal) =>
    request<T>("DELETE", path, { signal }),
};
