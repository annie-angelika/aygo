// The catalog seed: the canonical events + travelers both stores load from. It's
// derived from the same mock modules the frontend used, so turning the backend on
// changes *where* the data lives, not the data itself. Only the serializable
// domain objects are taken (no icons / class strings — those stay client config).

import { events } from "@/lib/events-data";
import { CITY_DATA } from "@/lib/cities-data";
import {
  FEATURED_CALENDARS,
  CATEGORY_PAGES,
  citiesWithCounts,
  categoriesWithCounts,
} from "@/lib/discover-data";
import { eventTimeFields } from "@/lib/server/store/draft-event";
import type { AygoEvent, TravelerProfile, Stamp, Attendee } from "@/types";

export const CATALOG_EVENTS: AygoEvent[] = events;
/** No seeded travelers — real accounts only. Empty is empty. */
export const CATALOG_USERS: TravelerProfile[] = [];
export const CATALOG_CITIES = CITY_DATA;
export const CATALOG_CALENDARS = FEATURED_CALENDARS;
export const CATALOG_CATEGORY_PAGES = CATEGORY_PAGES;

export { citiesWithCounts, categoriesWithCounts };

/**
 * The date the static catalog is authored around — the day its cluster of
 * events is meant to read as "today". Every seed re-anchors to the real today
 * by shifting all event dates by the gap from this anchor, so the demo stays a
 * live mix of past/upcoming events instead of freezing in whatever week the
 * seed was written.
 */
const SEED_ANCHOR = "2026-06-21";

/** Shift the date part of a "YYYY-MM-DDTHH:mm[:ss]" start by `days`, keeping the time. */
function shiftStart(startsAt: string, days: number): string {
  const [datePart, timePart = "00:00"] = startsAt.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  const shifted = new Date(y, m - 1, d + days);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${shifted.getFullYear()}-${p(shifted.getMonth() + 1)}-${p(shifted.getDate())}T${timePart}`;
}

/**
 * The catalog with every event re-anchored to today (see {@link SEED_ANCHOR}).
 * Both stores seed from this rather than the raw array, so a freshly seeded
 * database always has a natural spread of past and upcoming events. The derived
 * when-fields are recomputed from the shifted start; `withLiveAttendance`
 * refreshes them again on every read, so they never drift afterwards either.
 */
export function anchoredCatalogEvents(): AygoEvent[] {
  const [ay, am, ad] = SEED_ANCHOR.split("-").map(Number);
  const anchor = new Date(ay, am - 1, ad);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const offsetDays = Math.round(
    (today.getTime() - anchor.getTime()) / 86_400_000,
  );
  return CATALOG_EVENTS.map((e) => {
    // eventTimeFields returns `startsAt` alongside the derived when-fields.
    return { ...e, ...eventTimeFields(shiftStart(e.startsAt, offsetDays)) };
  });
}

/**
 * Overlay per-read fields onto catalog events so nothing goes stale in storage:
 *
 * - Live social proof: `attendees` is the real RSVP count and `attendeeAvatars`
 *   the first few goers with a saved avatar. Stored numbers are ignored —
 *   social proof is never seeded.
 * - Relative when-fields (`dayLabel`, `isPast`, …) are recomputed from
 *   `startsAt`, the same way created drafts are, so a seeded event authored as
 *   "Today" doesn't keep saying "Today" weeks later.
 */
export function withLiveAttendance(
  events: AygoEvent[],
  goingByEvent: Map<string, Attendee[]>,
): AygoEvent[] {
  return events.map((e) => {
    const goers = goingByEvent.get(e.id) ?? [];
    return {
      ...e,
      ...eventTimeFields(e.startsAt, e.endsAt),
      attendees: goers.length,
      attendeeAvatars: goers
        .map((g) => g.avatar)
        .filter((a): a is string => Boolean(a))
        .slice(0, 6),
    };
  });
}

/** Build the collectible aygo for an event (server-derived so it's trusted). */
export function stampFromEvent(event: AygoEvent): Stamp {
  return {
    eventId: event.id,
    title: event.title,
    category: event.category,
    image: event.cover,
  };
}
