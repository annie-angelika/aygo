// The catalog seed both stores load: cities, featured calendars and the
// per-interest page copy. No demo events and no demo people — everything
// guests see is created in the app. Only serializable domain objects live here
// (no icons / class strings — those stay client config).

import { CITY_DATA } from "@/lib/cities-seed";
import {
  FEATURED_CALENDARS,
  CATEGORY_PAGES,
  citiesWithCounts,
  categoriesWithCounts,
} from "@/lib/discover-data";
import { eventTimeFields } from "@/lib/server/store/draft-event";
import type { AygoEvent, Stamp, Attendee } from "@/types";

export const CATALOG_CITIES = CITY_DATA;
export const CATALOG_CALENDARS = FEATURED_CALENDARS;
export const CATALOG_CATEGORY_PAGES = CATEGORY_PAGES;

export { citiesWithCounts, categoriesWithCounts };

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
    city: event.city,
  };
}
