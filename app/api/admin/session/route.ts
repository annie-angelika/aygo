// The admin session: exchange the admin key for a signed httpOnly cookie.
//   GET    → { admin } — is this browser an admin right now?
//   POST   → { key }   — verify the key, mint the cookie
//   DELETE →           — sign out of admin

import {
  grantAdmin,
  revokeAdmin,
  hasAdminCookie,
  isValidAdminKey,
} from "@/lib/server/admin";
import { handler, json, noContent, readJson, HttpError } from "@/lib/server/http";

export const GET = handler(async () => {
  return json({ admin: await hasAdminCookie() });
});

export const POST = handler(async (req: Request) => {
  const { key } = await readJson<{ key?: string }>(req);
  if (!key || !isValidAdminKey(key)) {
    throw new HttpError(401, "Invalid admin key");
  }
  await grantAdmin();
  return noContent();
});

export const DELETE = handler(async () => {
  await revokeAdmin();
  return noContent();
});
