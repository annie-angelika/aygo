// GET /api/me/preferences → the guest's saved preferences (or null if none)
// PUT /api/me/preferences → persist them (shape-checked against the app's enums)

import { getStore } from "@/lib/server/store";
import { getSessionId } from "@/lib/server/session";
import { rateLimit, LIMITS } from "@/lib/server/rate-limit";
import { expectObject, enumOf, arrayOf, optStr } from "@/lib/server/validate";
import { findCityByName } from "@/lib/cities-seed";
import { CATEGORIES } from "@/lib/events-data";
import { handler, json, noContent, readJson, HttpError } from "@/lib/server/http";
import type { Preferences, Category } from "@/types";

/** Only what the app reads is stored: interests and a home city. */
function parsePreferences(body: unknown): Preferences {
  const b = expectObject(body, "preferences");
  const interests = [...new Set(arrayOf(b.interests, "interests", CATEGORIES.length, (x) => enumOf(x, "interest", CATEGORIES)))] as Category[];
  const homeRaw = optStr(b.homeCity, "homeCity", { max: 60 });
  const homeCity = homeRaw ? findCityByName(homeRaw)?.name : undefined;
  if (homeRaw && !homeCity) throw new HttpError(400, "homeCity must be one of the app's cities");
  return {
    ...(interests.length ? { interests } : null),
    ...(homeCity ? { homeCity } : null),
  };
}

export const GET = handler(async () => {
  const sid = await getSessionId();
  return json(await getStore().getPreferences(sid));
});

export const PUT = handler(async (req: Request) => {
  const sid = await getSessionId();
  rateLimit(req, "preferences", sid, LIMITS.preferences);
  await getStore().savePreferences(sid, parsePreferences(await readJson<unknown>(req)));
  return noContent();
});
