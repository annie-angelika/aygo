// "For you" ranking — deterministic rules over what we actually know about the
// user: chosen interests, home city, events they're going to, and what's coming
// up soon. Pure and synchronous so it runs anywhere. Designed to be swapped for
// (or re-ranked by) a model later: the signals are already isolated here.

import { cityKey } from "@/lib/utils";
import type { AygoEvent, Category, Preferences } from "@/types";

export type Taste = {
  interests: Category[];
  homeCity?: string;
  /** Ids the user registered for — their categories/cities count as signals too. */
  going: string[];
};

export function tasteFrom(prefs: Preferences, going: string[]): Taste {
  return { interests: prefs.interests ?? [], homeCity: prefs.homeCity, going };
}

/** Higher is better; 0 means "nothing speaks for it". */
export function scoreEvent(e: AygoEvent, taste: Taste, all: AygoEvent[], now = Date.now()): number {
  if (e.isPast) return 0;
  let score = 0;

  // Explicit interests are the strongest signal.
  if (taste.interests.includes(e.category)) score += 5;

  // Home city, then cities/categories inferred from what they're attending.
  const going = all.filter((x) => taste.going.includes(x.id));
  const goingCities = new Set(going.map((x) => cityKey(x.city)));
  const goingCats = new Set(going.map((x) => x.category));
  if (taste.homeCity && cityKey(e.city) === cityKey(taste.homeCity)) score += 4;
  else if (goingCities.has(cityKey(e.city))) score += 2;
  if (goingCats.has(e.category)) score += 1.5;

  // Sooner is better (decays over ~3 weeks), and a bit of social proof.
  const days = Math.max(0, (new Date(e.startsAt).getTime() - now) / 86_400_000);
  score += Math.max(0, 3 - days / 7);
  score += Math.min(2, e.attendees / 5);

  return score;
}

/** Top `limit` upcoming events for this taste (excluding ones they're already going to). */
export function recommend(events: AygoEvent[], taste: Taste, limit = 6): AygoEvent[] {
  return events
    .filter((e) => !e.isPast && !taste.going.includes(e.id))
    .map((e) => ({ e, s: scoreEvent(e, taste, events) }))
    .filter(({ s }) => s > 0)
    .sort((a, b) => b.s - a.s || a.e.startsAt.localeCompare(b.e.startsAt))
    .slice(0, limit)
    .map(({ e }) => e);
}

/** True when we know enough to personalize at all. */
export function hasTaste(taste: Taste): boolean {
  return taste.interests.length > 0 || !!taste.homeCity || taste.going.length > 0;
}
