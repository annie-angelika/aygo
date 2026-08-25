// GET /api/me/preferences → the guest's saved preferences (or null if none)
// PUT /api/me/preferences → persist them (shape-checked against the app's enums)

import { getStore } from "@/lib/server/store";
import { getSessionId } from "@/lib/server/session";
import { rateLimit, LIMITS } from "@/lib/server/rate-limit";
import { expectObject, enumOf, arrayOf, optStr } from "@/lib/server/validate";
import { findCityByName } from "@/lib/cities-seed";
import { CATEGORIES } from "@/lib/events-data";
import { handler, json, noContent, readJson, HttpError } from "@/lib/server/http";
import type { Preferences, NotificationChannel, Category } from "@/types";

const CHANNELS = ["email", "whatsapp", "push"] as const;
const NOTIFICATION_TYPES = ["invites", "reminders", "blasts", "updates", "feedback"] as const;

function parsePreferences(body: unknown): Preferences {
  const b = expectObject(body, "preferences");
  const theme = enumOf(b.theme ?? "system", "theme", ["system", "light", "dark"] as const);
  const language = enumOf(b.language ?? "en", "language", ["en", "es"] as const);
  const rawNotif = b.notifications == null ? {} : expectObject(b.notifications, "notifications");
  const notifications: Record<string, NotificationChannel[]> = {};
  for (const type of NOTIFICATION_TYPES) {
    if (rawNotif[type] == null) continue;
    notifications[type] = [...new Set(arrayOf(rawNotif[type], `notifications.${type}`, 3, (x) => enumOf(x, "channel", CHANNELS)))];
  }
  const interests = [...new Set(arrayOf(b.interests, "interests", CATEGORIES.length, (x) => enumOf(x, "interest", CATEGORIES)))] as Category[];
  const homeRaw = optStr(b.homeCity, "homeCity", { max: 60 });
  const homeCity = homeRaw ? findCityByName(homeRaw)?.name : undefined;
  if (homeRaw && !homeCity) throw new HttpError(400, "homeCity must be one of the app's cities");
  return {
    theme,
    language,
    notifications,
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
