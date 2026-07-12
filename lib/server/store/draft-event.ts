// Projects a guest-created EventDraft into the catalog's AygoEvent shape, so
// created events flow through the exact same list/detail pipeline as seeded
// ones. Both stores call it at read time: the stored draft stays the source of
// truth, and the relative fields ("Today", isPast) are recomputed per read
// instead of going stale in the database.

import type { AygoEvent, Category } from "@/types";
import type { EventDraft } from "@/lib/create-event";
import type { AdminEventInput } from "@/lib/server/store/types";
import { realAvatar } from "@/lib/utils";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** The create flow doesn't capture a category (yet) — every draft lands here. */
const DEFAULT_CATEGORY: Category = "Party";

/** Local "YYYY-MM-DD" for a Date, matching the draft's datetime-local shape. */
function dayKeyOf(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/**
 * The derived when-fields every catalog event carries, recomputed from a
 * "YYYY-MM-DDTHH:mm" start so relative labels never go stale. Shared by the
 * draft projection below and the admin's event upsert.
 */
export function eventTimeFields(startsAt: string) {
  const start = new Date(startsAt); // local time
  const now = new Date();
  const dayKey = startsAt.slice(0, 10);
  const todayKey = dayKeyOf(now);
  const tomorrowKey = dayKeyOf(
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
  );
  const dayLabel =
    dayKey === todayKey
      ? "Today"
      : dayKey === tomorrowKey
        ? "Tomorrow"
        : `${WEEKDAYS_SHORT[start.getDay()]}, ${MONTHS_SHORT[start.getMonth()]} ${start.getDate()}`;
  return {
    startsAt,
    dayKey,
    dayLabel,
    weekday: WEEKDAYS[start.getDay()],
    timeLabel: startsAt.slice(11, 16),
    isPast: start.getTime() < now.getTime(),
  };
}

/** URL-safe id from a title ("Peña en Sopocachi" → "pena-en-sopocachi"). */
export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "event"
  );
}

/**
 * Build the full catalog event an admin upsert stores. `existing` (an edit)
 * keeps the fields the form doesn't manage — attendee counts and the host
 * avatar — so editing a seeded event never wipes its social proof.
 */
export function adminInputToEvent(
  input: AdminEventInput,
  id: string,
  existing?: AygoEvent | null,
): AygoEvent {
  return {
    id,
    title: input.title.trim(),
    category: input.category,
    cover:
      input.cover?.trim() ||
      existing?.cover ||
      `https://picsum.photos/seed/aygo-${id}/800/600`,
    ...eventTimeFields(input.startsAt),
    place: input.place.trim(),
    city: input.city.trim(),
    ...(input.lat != null && input.lng != null
      ? { lat: input.lat, lng: input.lng }
      : existing?.lat != null && existing?.lng != null
        ? { lat: existing.lat, lng: existing.lng }
        : null),
    host: {
      name: input.hostName?.trim() || existing?.host.name || "aygo",
      // No invented faces: an empty avatar renders as initials in the UI.
      avatar: existing?.host.avatar ?? "",
      ...(input.hostPhone?.trim() || existing?.host.phone
        ? { phone: input.hostPhone?.trim() || existing?.host.phone }
        : null),
    },
    attendees: existing?.attendees ?? 0,
    attendeeAvatars: existing?.attendeeAvatars ?? [],
    price: input.price,
    blurb: input.blurb.trim(),
  };
}

/** Who created the draft — the fields we can borrow from their saved profile. */
export type Creator = { name?: string; avatar?: string };

/**
 * Merge an admin edit into a guest-created draft. The draft stays the single
 * source of truth for created events, so an /admin edit must land here — not
 * as a shadow copy in the catalog. Location round-trips through the
 * "Place, City" shape `draftToEvent` splits on.
 */
export function applyAdminInput(
  draft: EventDraft,
  input: AdminEventInput,
): EventDraft {
  return {
    ...draft,
    title: input.title.trim(),
    category: input.category,
    startsAt: input.startsAt,
    location: `${input.place.trim()}, ${input.city.trim()}`,
    price: input.price,
    description: input.blurb.trim(),
    ...(input.cover?.trim() ? { cover: input.cover.trim() } : null),
    ...(input.lat != null && input.lng != null
      ? { lat: input.lat, lng: input.lng }
      : null),
    ...(input.hostName?.trim() ? { hostName: input.hostName.trim() } : null),
    ...(input.hostPhone?.trim() ? { hostPhone: input.hostPhone.trim() } : null),
  };
}

export function draftToEvent(draft: EventDraft, creator?: Creator): AygoEvent {
  // Location is free text. "Place, City" splits on the last comma; a bare
  // place falls back to the app's home city.
  const comma = draft.location.lastIndexOf(",");
  const place =
    (comma > 0 ? draft.location.slice(0, comma) : draft.location).trim() ||
    "To be announced";
  const city = (comma > 0 ? draft.location.slice(comma + 1) : "").trim() || "La Paz";

  return {
    id: draft.id,
    title: draft.title.trim() || "Untitled event",
    category: draft.category ?? DEFAULT_CATEGORY,
    // No cover picked → a stable image derived from the chosen THEME, so the
    // same theme always shows the same photo (not a fresh random per event).
    cover:
      draft.cover ??
      `https://picsum.photos/seed/aygo-theme-${draft.theme}/800/600`,
    ...eventTimeFields(draft.startsAt),
    place,
    city,
    ...(draft.lat != null && draft.lng != null
      ? { lat: draft.lat, lng: draft.lng }
      : null),
    host: {
      name: draft.hostName || creator?.name || "aygo member",
      // No invented faces — and ignore stock-photo avatars older builds baked
      // into synced profiles. Empty renders as initials in the UI.
      avatar: realAvatar(creator?.avatar) ?? "",
      ...(draft.hostPhone ? { phone: draft.hostPhone } : null),
    },
    attendees: 0,
    attendeeAvatars: [],
    price: draft.price,
    blurb: draft.description,
    requiresApproval: draft.requiresApproval,
  };
}
