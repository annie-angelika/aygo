// The account ↔ session link (see lib/server/session.ts):
//   POST   { account, name?, avatar? } → make this browser's session the one that
//          belongs to `account` (a hash of the signed-in identity). Also seeds
//          the profile from the social login the first time, so hosts and
//          guests see a real name instead of "Guest". Returns { changed }.
//   DELETE → sign out: rotate to a fresh anonymous session.

import { getStore } from "@/lib/server/store";
import { switchToAccount, resetSession } from "@/lib/server/session";
import { rateLimit, LIMITS } from "@/lib/server/rate-limit";
import { expectObject, str, optStr } from "@/lib/server/validate";
import { validateImage, AVATAR_LIMITS } from "@/lib/server/images";
import { moderateFields } from "@/lib/server/moderation";
import { handler, json, readJson, HttpError } from "@/lib/server/http";
import { realAvatar } from "@/lib/utils";

const SESSION_BODY_BYTES = 512 * 1024;

export const POST = handler(async (req: Request) => {
  rateLimit(req, "session", null, LIMITS.session, LIMITS.session);
  const b = expectObject(await readJson<unknown>(req, SESSION_BODY_BYTES));
  const account = str(b.account, "account", { max: 64, pattern: /^[a-f0-9]{16,64}$/ });
  const name = optStr(b.name, "name", { max: 80 });
  const avatar = b.avatar ? validateImage(b.avatar, "avatar", AVATAR_LIMITS) : undefined;
  if (name && !moderateFields({ name }, { name: "title" }).ok) throw new HttpError(400, "name isn't allowed");

  const { changed, sid } = await switchToAccount(account);

  // First sign-in on this session: borrow the social identity for the profile.
  const store = getStore();
  const profile = await store.getProfile(sid);
  if (!profile.name && name) {
    await store.saveProfile(sid, {
      name,
      bio: profile.bio ?? "",
      location: profile.location ?? "",
      avatar: realAvatar(avatar) ?? profile.avatar ?? "",
      socials: profile.socials ?? {},
    });
  }
  return json({ changed });
});

export const DELETE = handler(async (req: Request) => {
  rateLimit(req, "session", null, LIMITS.session, LIMITS.session);
  return json(await resetSession());
});
