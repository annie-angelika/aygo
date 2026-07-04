// CORS for the API. Same-origin calls (the app hitting its own /api) need
// nothing; this only kicks in for browsers on an allowlisted origin
// (AYGO_CORS_ORIGINS). It answers preflight OPTIONS and tags responses with the
// matching CORS headers. In Next.js 16 this file is the "proxy" (formerly
// middleware). Everything else passes straight through.

import { NextResponse, type NextRequest } from "next/server";

const ALLOWED = (process.env.AYGO_CORS_ORIGINS ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

export const config = { matcher: "/api/:path*" };

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

export function proxy(req: NextRequest): NextResponse {
  const origin = req.headers.get("origin");
  const allowed = origin !== null && ALLOWED.includes(origin);

  // Preflight: answer directly, no need to reach the route handler.
  if (req.method === "OPTIONS") {
    const res = new NextResponse(null, { status: 204 });
    if (allowed) applyCors(res, origin);
    return res;
  }

  const res = NextResponse.next();
  if (allowed) applyCors(res, origin);
  return res;
}
