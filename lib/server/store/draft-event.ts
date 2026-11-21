// Projects a guest-created EventDraft into the catalog's AygoEvent shape, so
// created events flow through the exact same list/detail pipeline as seeded
// ones. Both stores call it at read time: the stored draft stays the source of
// truth, and the relative fields ("Today", isPast) are recomputed per read
// instead of going stale in the database.

import type { AygoEvent, Category } from "@/types";
import type { EventDraft } from "@/lib/create-event";
import type { AdminEventInput } from "@/lib/server/store/types";
import { realAvatar } from "@/lib/utils";
import { localToInstant, dayKeyAt, wallClock } from "@/lib/event-time";
import { HOME_CITY } from "@/lib/cities-seed";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Drafts older than the interest picker land here; new ones always carry one. */
const DEFAULT_CATEGORY: Category = "Culture";
/** aygo's own artwork for an admin event created without a cover. */
const DEFAULT_ADMIN_COVER = "/covers/aygo-night.png";

/**
 * The derived when-fields every catalog event carries, recomputed from a
 * "YYYY-MM-DDTHH:mm" start so relative labels never go stale. Everything is
 * resolved in the EVENT's timezone (default Bolivia), never the server's —
 * see lib/event-time.ts. Shared by the draft projection below and the admin's
 * event upsert.
 */
export function eventTimeFields(startsAt: string, endsAt?: string, timezone?: string) {
  const startMs = localToInstant(startsAt, timezone);
  const endMs = endsAt ? localToInstant(endsAt, timezone) : startMs;
  const now = Date.now();
  const dayKey = startsAt.slice(0, 10);
  const todayKey = dayKeyAt(now, timezone);
  const tomorrowKey = dayKeyAt(now + 86_400_000, timezone);
  const start = wallClock(startMs, timezone);
  const dayLabel =
    dayKey === todayKey
      ? "Today"
      : dayKey === tomorrowKey
        ? "Tomorrow"
        : `${WEEKDAYS_SHORT[start.weekday]}, ${MONTHS_SHORT[start.month]} ${start.day}`;
  // A multi-day event stays "upcoming" until it actually ends, not the moment it
  // starts — so isPast keys off the end when there is one.
  return {
    startsAt,
    dayKey,
    dayLabel,
    weekday: WEEKDAYS[start.weekday],
    timeLabel: startsAt.slice(11, 16),
    isPast: Number.isFinite(endMs) ? endMs < now : false,
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
    cover: input.cover?.trim() || existing?.cover || DEFAULT_ADMIN_COVER,
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
    ...paymentOf(input.payWhatsapp ?? existing?.payment?.whatsapp, input.payLink ?? existing?.payment?.link),
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
    ...(input.payWhatsapp?.trim() ? { payWhatsapp: input.payWhatsapp.trim() } : null),
    ...(input.payLink?.trim() ? { payLink: input.payLink.trim() } : null),
  };
}

/** The public `payment` block, only when there's something to show. */
function paymentOf(whatsapp?: string | null, link?: string | null, wallet?: string | null) {
  const payment = {
    ...(whatsapp ? { whatsapp } : null),
    ...(link ? { link } : null),
    ...(wallet ? { wallet } : null),
  };
  return Object.keys(payment).length ? { payment } : null;
}

/**
 * `light` is the list projection: no gallery, and the small `thumb` in place
 * of a base64 cover — so `GET /events` stays a few KB per event instead of
 * shipping every photo of every hosted event. Detail reads use the full shape.
 */
export function draftToEvent(
  draft: EventDraft,
  creator?: Creator,
  { light = false }: { light?: boolean } = {},
): AygoEvent {
  // City resolution: an explicit "Place, City" typed into the location wins (the
  // manage editor works this way), then the create flow's `city` field, then the
  // app's home city. The create flow's location is a bare venue (no comma), so it
  // falls through to `draft.city`.
  const comma = draft.location.lastIndexOf(",");
  const place =
    (comma > 0 ? draft.location.slice(0, comma) : draft.location).trim() ||
    "To be announced";
  const city =
    (comma > 0 ? draft.location.slice(comma + 1) : "").trim() ||
    draft.city?.trim() ||
    HOME_CITY;

  return {
    id: draft.id,
    title: draft.title.trim() || "Untitled event",
    category: draft.category ?? DEFAULT_CATEGORY,
    // No photo → an empty cover; the THEME is the cover then (see ThemeCover),
    // so changing the theme changes what every list and page shows.
    cover: (light ? draft.thumb : undefined) ?? draft.images?.[0] ?? draft.cover ?? "",
    theme: draft.theme,
    ...(!light && draft.images && draft.images.length > 0 ? { images: draft.images } : null),
    ...(draft.coverPosition ? { coverPosition: draft.coverPosition } : null),
    ...eventTimeFields(draft.startsAt, draft.endsAt, draft.timezone),
    ...(draft.endsAt ? { endsAt: draft.endsAt } : null),
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
    ...(draft.capacity != null ? { capacity: draft.capacity } : null),
    ...paymentOf(draft.payWhatsapp ?? draft.hostPhone?.replace(/\D/g, ""), draft.payLink, draft.payWallet),
    blurb: draft.description,
    requiresApproval: draft.requiresApproval,
  };
}
