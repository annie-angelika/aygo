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
import type { AygoEvent, TravelerProfile, Stamp, Attendee } from "@/types";

export const CATALOG_EVENTS: AygoEvent[] = events;
/** No seeded travelers — real accounts only. Empty is empty. */
export const CATALOG_USERS: TravelerProfile[] = [];
export const CATALOG_CITIES = CITY_DATA;
export const CATALOG_CALENDARS = FEATURED_CALENDARS;
export const CATALOG_CATEGORY_PAGES = CATEGORY_PAGES;

export { citiesWithCounts, categoriesWithCounts };

/**
 * Overlay live social proof onto catalog events: `attendees` is the real RSVP
 * count and `attendeeAvatars` the first few goers with a saved avatar. Stored
 * numbers are ignored — social proof is never seeded.
 */
export function withLiveAttendance(
  events: AygoEvent[],
  goingByEvent: Map<string, Attendee[]>,
): AygoEvent[] {
  return events.map((e) => {
    const goers = goingByEvent.get(e.id) ?? [];
    return {
      ...e,
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
