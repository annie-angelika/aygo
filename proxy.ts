// Request gate + API hardening. In Next.js 16 this file is the "proxy"
// (formerly middleware). It runs on every page and API request (the matcher
// only skips static assets) and does three things:
//
//  1. Dev access gate — on the dev deployment (AYGO_DEV_ACCESS_CODE set, never
//     in production) nothing is served until the browser holds the `aygo_dev`
//     cookie. See lib/server/dev-access.ts.
//  2. noindex on previews — dev.aygo.app must never show up in Google.
//  3. CORS + CSRF for /api — same-origin calls need nothing; browsers on an
//     allowlisted origin (AYGO_CORS_ORIGINS) get CORS headers, and cookie-
//     authenticated writes from anywhere else are refused.

import { NextResponse, type NextRequest } from "next/server";
import {
  DEV_ACCESS_COOKIE,
  DEV_ACCESS_COOKIE_OPTS,
  DEV_GATE_ENABLED,
  IS_PREVIEW,
  devAccessToken,
  hasDevAccess,
  verifyDevCode,
} from "@/lib/server/dev-access";

const ALLOWED = (process.env.AYGO_CORS_ORIGINS ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

export const config = {
  // Everything except Next's build output and plain files in /public.
  matcher: [
    "/((?!_next/static|_next/image|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|avif|txt|xml|webmanifest)$).*)",
  ],
};

/** Paths that must stay reachable while locked: the gate itself. */
const GATE_PATHS = new Set(["/dev-access", "/api/dev-access"]);

/**
 * Returns a response that ends the request (redirect to the gate, 401 for the
 * API, or a cookie-setting redirect for a `?code=` link), or null to let the
 * request through.
 */
async function devGate(req: NextRequest): Promise<NextResponse | null> {
  const { pathname, searchParams } = req.nextUrl;
  if (GATE_PATHS.has(pathname)) return null;
  if (await hasDevAccess(req.cookies.get(DEV_ACCESS_COOKIE)?.value)) return null;

  // Shareable link: dev.aygo.app/whatever?code=XXXX unlocks and drops the code
  // from the URL so it isn't left in history or copied along.
  const code = searchParams.get("code");
  if (code && (await verifyDevCode(code))) {
    const clean = req.nextUrl.clone();
    clean.searchParams.delete("code");
    const res = NextResponse.redirect(clean);
    res.cookies.set(DEV_ACCESS_COOKIE, await devAccessToken(), DEV_ACCESS_COOKIE_OPTS);
    return res;
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ message: "Dev access required" }, { status: 401 });
  }
  const gate = new URL("/dev-access", req.url);
  const next = pathname + req.nextUrl.search;
  if (next !== "/") gate.searchParams.set("next", next);
  return NextResponse.redirect(gate);
}

function applyCors(res: NextResponse, origin: string): void {
  res.headers.set("Access-Control-Allow-Origin", origin);
  res.headers.set("Vary", "Origin");
  res.headers.set("Access-Control-Allow-Credentials", "true");
  res.headers.set(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  );
  res.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, x-admin-token",
  );
}

const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * CSRF guard for cookie-authenticated writes. Browsers always attach `Origin`
 * (and `Sec-Fetch-Site`) to cross-site POSTs, so a write whose Origin is
 * neither this host nor an allowlisted one is refused before any handler
 * runs. Requests without an Origin (curl, server-to-server) carry no browser
 * cookies to abuse and pass through.
 */
function crossSite(req: NextRequest): boolean {
  if (!MUTATING.has(req.method)) return false;
  const site = req.headers.get("sec-fetch-site");
  if (site === "cross-site") return true;
  const origin = req.headers.get("origin");
  if (!origin) return false;
  if (ALLOWED.includes(origin)) return false;
  try {
    return new URL(origin).host !== req.nextUrl.host;
  } catch {
    return true;
  }
}

function api(req: NextRequest): NextResponse {
  const origin = req.headers.get("origin");
  const allowed = origin !== null && ALLOWED.includes(origin);

  // Preflight: answer directly, no need to reach the route handler.
  if (req.method === "OPTIONS") {
    const res = new NextResponse(null, { status: 204 });
    if (allowed) applyCors(res, origin);
    return res;
  }

  if (crossSite(req)) {
    return NextResponse.json(
      { message: "Cross-site request refused" },
      { status: 403 },
    );
  }

  const res = NextResponse.next();
  if (allowed) applyCors(res, origin);
  // API responses are data, never documents: no sniffing, no caching of
  // per-user payloads by shared proxies.
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}

export async function proxy(req: NextRequest): Promise<NextResponse> {
  if (DEV_GATE_ENABLED) {
    const blocked = await devGate(req);
    if (blocked) return blocked;
  }

  const res = req.nextUrl.pathname.startsWith("/api/") ? api(req) : NextResponse.next();
  if (IS_PREVIEW) res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}
