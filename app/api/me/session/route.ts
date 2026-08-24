// The account ↔ session link (see lib/server/session.ts):
//   POST   { account, name?, avatar? } → make this browser's session the one that
//          belongs to `account` (a hash of the signed-in identity). Also seeds
//          the profile from the social login the first time, so hosts and
//          guests see a real name instead of "Guest". Returns { changed }.
//   DELETE → sign out: rotate to a fresh anonymous session.

import { getStore } from "@/lib/server/store";
import { switchToAccount, resetSession } from "@/lib/server/session";
import { handler, json, readJson, HttpError } from "@/lib/server/http";
import { realAvatar } from "@/lib/utils";

export const POST = handler(async (req: Request) => {
  const { account, name, avatar } = await readJson<{
    account?: string;
    name?: string;
    avatar?: string;
  }>(req);
  if (!account || !/^[a-f0-9]{16,64}$/.test(account))
    throw new HttpError(400, "account must be a hex digest");

  const { changed, sid } = await switchToAccount(account);

  // First sign-in on this session: borrow the social identity for the profile.
  const store = getStore();
  const profile = await store.getProfile(sid);
  if (!profile.name && name?.trim()) {
    await store.saveProfile(sid, {
      name: name.trim().slice(0, 80),
      bio: profile.bio ?? "",
      location: profile.location ?? "",
      avatar: realAvatar(avatar) ?? profile.avatar ?? "",
      socials: profile.socials ?? {},
    });
  }
  return json({ changed });
});

export const DELETE = handler(async () => {
  return json(await resetSession());
});
