// The Luma-style create flow lives entirely on the client (no host backend yet),
// so the draft shape, the cover themes, and the few option lists are defined here
// and a created event is persisted locally. Swap `saveDraft` for a real POST when
// the backend lands; the screen and its parts won't need to change.

import { CURRENT_USER } from "@/lib/events-data";
import { STORAGE_KEYS, readStorage, writeStorage } from "@/lib/storage";

export type { ThemeId } from "@/lib/create-themes";

/** Who an event can be seen by. */
export type Visibility = "public" | "private";

/** A single calendar the event can be created under. */
export type CalendarOption = { id: string; name: string; avatar: string };

export const CALENDARS: CalendarOption[] = [
  { id: "personal", name: "Personal Calendar", avatar: CURRENT_USER.avatar },
];

/** Common time zones for the picker (Bolivia first). */
export const TIMEZONES = [
  "GMT-04:00 La Paz",
  "GMT-03:00 Buenos Aires",
  "GMT-05:00 Lima",
  "GMT-05:00 Bogotá",
  "GMT-06:00 Mexico City",
];

/** What gets saved when you tap "Create Event". */
export type EventDraft = {
  id: string;
  title: string;
  theme: string; // theme id, see lib/create-themes
  cover: string | null;
  calendarId: string;
  visibility: Visibility;
  startsAt: string;
  endsAt: string;
  timezone: string;
  location: string;
  description: string;
  price: number | null; // null/0 → free, BOB otherwise
  requiresApproval: boolean;
  capacity: number | null; // null → unlimited
  createdAt: string;
};

/**
 * Stock cover images for the picker (Picsum). Heights vary so the picker can lay
 * them out masonry-style and show each photo whole, rather than square-cropped.
 */
const COVER_HEIGHTS = [820, 600, 540, 760, 640, 900, 700];
export const STOCK_COVERS = [
  "world-cup", "previous-events", "sports", "spring", "july-4th", "climate",
  "music-fest", "art-night", "food-market", "mountains", "beach", "city-lights",
  "festival", "garden", "studio", "neon-room", "desert", "forest",
].map((seed, i) => `https://picsum.photos/seed/aygo-${seed}/600/${COVER_HEIGHTS[i % COVER_HEIGHTS.length]}`);

/** Append a created event to local storage so the flow has a real effect. */
export function saveDraft(draft: EventDraft): void {
  const existing = readStorage<EventDraft[]>(STORAGE_KEYS.created, []);
  writeStorage(STORAGE_KEYS.created, [draft, ...existing]);
}
