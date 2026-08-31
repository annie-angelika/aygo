// The account ↔ session link (see lib/server/session.ts):
//   POST   { accessToken, dpop } → verify the Pollar login server-side (the
//          browser signed a DPoP proof for Pollar's session check; we relay
//          it) and make this browser's session the one that belongs to that
//          verified identity — on any device. Seeds the profile from the
//          social login the first time. Returns { changed }, or 428 { nonce }
//          when Pollar wants the proof rebuilt with a server nonce.
//   DELETE → sign out: rotate to a fresh anonymous session.

import { getStore } from "@/lib/server/store";
import { switchToAccount, resetSession } from "@/lib/server/session";
import {
  verifyPollarSession,
  identitiesOf,
  accountKeyOf,
  DpopNonceRequired,
} from "@/lib/server/pollar";
import { rateLimit, LIMITS } from "@/lib/server/rate-limit";
import { expectObject, str } from "@/lib/server/validate";
import { validateImage, AVATAR_LIMITS } from "@/lib/server/images";
import { moderateFields } from "@/lib/server/moderation";
import { handler, json, readJson, HttpError } from "@/lib/server/http";
import { realAvatar } from "@/lib/utils";

const SESSION_BODY_BYTES = 16 * 1024;
/** Compact JWS: three base64url segments. */
const JWS = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

export const POST = handler(async (req: Request) => {
  rateLimit(req, "session", null, LIMITS.session, LIMITS.session);
  const b = expectObject(await readJson<unknown>(req, SESSION_BODY_BYTES));
  const accessToken = str(b.accessToken, "accessToken", { max: 4096 });
  const dpop = str(b.dpop, "dpop", { max: 4096, pattern: JWS });

  let profile;
  try {
    profile = await verifyPollarSession(accessToken, dpop);
  } catch (e) {
    if (e instanceof DpopNonceRequired) return json({ nonce: e.nonce }, 428);
    throw e;
  }
  const identities = identitiesOf(profile);
  if (identities.length === 0)
    throw new HttpError(401, "Your login carries no identity we can use");

  const { changed, sid } = await switchToAccount(identities.map(accountKeyOf));

  // First sign-in for this account: borrow the verified social identity for
  // the profile, so hosts and guests see a real name instead of "Guest".
  const store = getStore();
  const current = await store.getProfile(sid);
  if (!current.name) {
    const name = `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim().slice(0, 80);
    const avatar = safeAvatar(profile.avatar);
    if (name && moderateFields({ name }, { name: "title" }).ok) {
      await store.saveProfile(sid, {
        name,
        bio: current.bio ?? "",
        location: current.location ?? "",
        avatar: avatar ?? current.avatar ?? "",
        socials: current.socials ?? {},
      });
    }
  }
  return json({ changed });
});

/** A provider avatar only when it passes the same checks as an upload. */
function safeAvatar(src: string | undefined): string | undefined {
  if (!src) return undefined;
  try {
    return realAvatar(validateImage(src, "avatar", AVATAR_LIMITS));
  } catch {
    return undefined;
  }
}

export const DELETE = handler(async (req: Request) => {
  rateLimit(req, "session", null, LIMITS.session, LIMITS.session);
  return json(await resetSession());
});
