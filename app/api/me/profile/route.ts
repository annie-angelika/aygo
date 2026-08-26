// GET /api/me/profile → the guest's saved profile edits + their username
// PUT /api/me/profile → persist the edits (validated: lengths, real image, safe
// social handles/URLs, content filter on name/bio/location). `username` is
// ignored here — it's unique and lives behind PUT /me/username.

import { getStore } from "@/lib/server/store";
import { getSessionId } from "@/lib/server/session";
import { rateLimit, LIMITS } from "@/lib/server/rate-limit";
import { expectObject, str, optStr, httpsUrl, HANDLE } from "@/lib/server/validate";
import { validateImage, AVATAR_LIMITS } from "@/lib/server/images";
import { moderateFields } from "@/lib/server/moderation";
import { LIMITS as TEXT } from "@/lib/server/validate-draft";
import { handler, json, noContent, readJson, HttpError } from "@/lib/server/http";
import type { ProfileEdits, Socials } from "@/types";

const PROFILE_BODY_BYTES = 512 * 1024; // room for a 240px avatar
const HANDLE_KEYS = ["instagram", "x", "youtube", "tiktok", "linkedin"] as const;

export function parseProfile(body: unknown): ProfileEdits {
  const b = expectObject(body, "profile");
  const name = str(b.name, "name", { min: 2, max: TEXT.name });
  const bio = optStr(b.bio, "bio", { max: TEXT.bio, multiline: true }) ?? "";
  const location = optStr(b.location, "location", { max: TEXT.place }) ?? "";
  const avatar = b.avatar ? validateImage(b.avatar, "avatar", AVATAR_LIMITS) : "";
  const s = b.socials == null ? {} : expectObject(b.socials, "socials");
  const socials: Socials = {};
  for (const key of HANDLE_KEYS) {
    const v = optStr(s[key], key, { max: 65, pattern: HANDLE });
    if (v) socials[key] = v.replace(/^@/, "");
  }
  const website = optStr(s.website, "website", { max: 2048 });
  if (website) socials.website = httpsUrl(/^https?:\/\//i.test(website) ? website : `https://${website}`, "website");
  const verdict = moderateFields({ name, bio, location }, { name: "title", bio: "body", location: "title" });
  if (!verdict.ok) throw new HttpError(400, verdict.reason);
  return { name, bio, location, avatar, socials };
}

export const GET = handler(async () => {
  const sid = await getSessionId();
  return json(await getStore().getProfile(sid));
});

export const PUT = handler(async (req: Request) => {
  const sid = await getSessionId();
  rateLimit(req, "profile", sid, LIMITS.profile);
  const edits = parseProfile(await readJson<unknown>(req, PROFILE_BODY_BYTES));
  await getStore().saveProfile(sid, edits);
  return noContent();
});
