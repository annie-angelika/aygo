// The Luma-style create flow lives entirely on the client (no host backend yet),
// so the draft shape, the cover themes, and the few option lists are defined here
// and a created event is persisted locally. Swap `saveDraft` for a real POST when
// the backend lands; the screen and its parts won't need to change.

import { CURRENT_USER } from "@/lib/events-data";
import { STORAGE_KEYS, readStorage, writeStorage } from "@/lib/storage";
import type { Category } from "@/types";

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
  /** Every photo (the cover is the first). Absent on older drafts. */
  images?: string[];
  /** CSS object-position for the cover — the host's chosen focal point. */
  coverPosition?: string;
  /** Small (≤480px) copy of the cover for lists, generated client-side on save. */
  thumb?: string;
  calendarId: string;
  visibility: Visibility;
  startsAt: string;
  endsAt: string;
  timezone: string;
  location: string;
  /** City the event belongs to (its grouping bucket). Chosen in the create flow. */
  city?: string;
  /** Filled server-side by geocoding `location` when the draft syncs. */
  lat?: number;
  lng?: number;
  description: string;
  price: number | null; // null/0 → free, BOB otherwise
  /** Required when price > 0 (at least one): how guests pay the host. */
  payWhatsapp?: string; // international digits, e.g. "59171234567"
  payLink?: string; // https payment link
  requiresApproval: boolean;
  capacity: number | null; // null → unlimited
  createdAt: string;
  /** Interest the event is filed under — chosen in the create flow. */
  category?: Category;
  /** Admin overrides (an /admin edit of this draft) — the create flow never sets these. */
  hostName?: string;
  hostPhone?: string;
};


/** How many photos an event can carry (each is a resized JPEG data URL). */
export const MAX_IMAGES = 6;

/**
 * Uploaded photos are data URLs; keep them out of localStorage (they'd blow the
 * quota after a couple of events) — the server copy is the source of truth for
 * media, the local list only needs ids + metadata.
 */
export function stripDraftMedia(draft: EventDraft): EventDraft {
  const local = (src: string | null | undefined) =>
    src && src.startsWith("data:") ? null : (src ?? null);
  const { thumb: _thumb, ...rest } = draft;
  void _thumb;
  return {
    ...rest,
    cover: local(draft.cover),
    images: draft.images?.map((i) => local(i)).filter((i): i is string => !!i),
  };
}
const stripMedia = stripDraftMedia;

/** Save (or replace) a created event in local storage so the flow has a real effect. */
export function saveDraft(draft: EventDraft): void {
  const existing = readStorage<EventDraft[]>(STORAGE_KEYS.created, []);
  writeStorage(STORAGE_KEYS.created, [
    stripMedia(draft),
    ...existing.filter((d) => d.id !== draft.id),
  ]);
}

/** Replace the local list wholesale (from the server's copy on sync). */
export function replaceDrafts(drafts: EventDraft[]): void {
  writeStorage(STORAGE_KEYS.created, drafts.map(stripMedia));
}

/** Drop a created event from local storage (after the server delete succeeds). */
export function removeDraft(id: string): void {
  const existing = readStorage<EventDraft[]>(STORAGE_KEYS.created, []);
  writeStorage(
    STORAGE_KEYS.created,
    existing.filter((d) => d.id !== id),
  );
}
