// The admin session: exchange the admin key for a signed httpOnly cookie.
//   GET    → { admin } — is this browser an admin right now?
//   POST   → { key }   — verify the key, mint the cookie (rate limited per IP
//                        so the key can't be brute-forced)
//   DELETE →           — sign out of admin

import {
  grantAdmin,
  revokeAdmin,
  hasAdminCookie,
  isValidAdminKey,
} from "@/lib/server/admin";
import { rateLimit, LIMITS } from "@/lib/server/rate-limit";
import { expectObject, str } from "@/lib/server/validate";
import { handler, json, noContent, readJson, HttpError } from "@/lib/server/http";

export const GET = handler(async () => {
  return json({ admin: await hasAdminCookie() });
});

export const POST = handler(async (req: Request) => {
  rateLimit(req, "admin:login", null, LIMITS.adminLogin, LIMITS.adminLogin);
  const key = str(expectObject(await readJson<unknown>(req)).key, "key", { max: 256 });
  if (!isValidAdminKey(key)) throw new HttpError(401, "Invalid admin key");
  await grantAdmin();
  return noContent();
});

export const DELETE = handler(async () => {
  await revokeAdmin();
  return noContent();
});
