// POST /api/dev-access → checks the dev access code from the /dev-access form
// and, when it matches, sets the `aygo_dev` cookie the proxy looks for. Always
// answers with a redirect: back to the page that was requested on success, back
// to the form with `?error=1` otherwise. Guessing is throttled per IP.

import { NextResponse } from "next/server";
import {
  DEV_ACCESS_COOKIE,
  DEV_ACCESS_COOKIE_OPTS,
  DEV_GATE_ENABLED,
  devAccessToken,
  safeNext,
  verifyDevCode,
} from "@/lib/server/dev-access";
import { handler } from "@/lib/server/http";
import { rateLimit, LIMITS } from "@/lib/server/rate-limit";

export const POST = handler(async (req: Request) => {
  if (!DEV_GATE_ENABLED) return NextResponse.json({ message: "Not found" }, { status: 404 });
  rateLimit(req, "devAccess", null, LIMITS.devAccess, LIMITS.devAccess);

  const form = await req.formData();
  const code = String(form.get("code") ?? "");
  const next = safeNext(String(form.get("next") ?? ""));

  if (!(await verifyDevCode(code))) {
    const back = new URL("/dev-access", req.url);
    back.searchParams.set("error", "1");
    if (next !== "/") back.searchParams.set("next", next);
    return NextResponse.redirect(back, 303);
  }

  const res = NextResponse.redirect(new URL(next, req.url), 303);
  res.cookies.set(DEV_ACCESS_COOKIE, await devAccessToken(), DEV_ACCESS_COOKIE_OPTS);
  return res;
});
