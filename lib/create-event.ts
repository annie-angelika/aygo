// The Luma-style create flow lives entirely on the client (no host backend yet),
// so the draft shape, the cover themes, and the few option lists are defined here
// and a created event is persisted locally. Swap `saveDraft` for a real POST when
// the backend lands; the screen and its parts won't need to change.

import { CURRENT_USER } from "@/lib/events-data";
import { STORAGE_KEYS, readStorage, writeStorage } from "@/lib/storage";

/** Cover themes — the look applied to the invite card (Minimal / Quantum / Warp). */
export type ThemeId = "minimal" | "quantum" | "warp";

export const THEMES: { id: ThemeId; name: string; swatch: string }[] = [
  { id: "minimal", name: "Minimal", swatch: "bg-neutral-200" },
  { id: "quantum", name: "Quantum", swatch: "bg-gradient-to-br from-sky-400 to-fuchsia-500" },
  { id: "warp", name: "Warp", swatch: "bg-gradient-to-br from-violet-700 to-indigo-950" },
];

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
  theme: ThemeId;
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

/** Stock cover images shown in the image picker (Picsum, like the rest of the app). */
export const STOCK_COVERS = [
  "world-cup",
  "previous-events",
  "sports",
  "spring",
  "july-4th",
  "climate",
  "music-fest",
  "art-night",
  "food-market",
].map((seed) => `https://picsum.photos/seed/aygo-${seed}/600/600`);

/** Append a created event to local storage so the flow has a real effect. */
export function saveDraft(draft: EventDraft): void {
  const existing = readStorage<EventDraft[]>(STORAGE_KEYS.created, []);
  writeStorage(STORAGE_KEYS.created, [draft, ...existing]);
}
