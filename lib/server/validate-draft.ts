// Server-side rules for a host's event draft. The create flow validates as you
// type, but the API is the boundary — anything reaching the store went through
// here: shape, dates (no past events), media limits, price, and the content
// filter on every free-text field.

import "server-only";
import { HttpError } from "@/lib/server/http";
import { moderateFields } from "@/lib/server/moderation";
import { MAX_IMAGES, type EventDraft } from "@/lib/create-event";
import { localToInstant } from "@/lib/event-time";

/** Largest single photo we store (a resized JPEG data URL, ~1.5 MB of base64). */
const MAX_IMAGE_CHARS = 1_600_000;
/** An event may start a little in the past when created live ("happening now"). */
const GRACE_MS = 60 * 60 * 1000;

const LOCAL_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

function isImageSrc(src: unknown): src is string {
  return (
    typeof src === "string" &&
    src.length <= MAX_IMAGE_CHARS &&
    (src.startsWith("data:image/") || /^https?:\/\//.test(src))
  );
}

/**
 * Throws a 400 with a user-facing message when the draft isn't publishable.
 * `previous` is the stored draft on an edit — an event that's already started
 * may keep its original dates, but can't be moved into the past.
 */
export function validateDraft(draft: EventDraft, previous?: EventDraft | null): void {
  if (!draft.title?.trim()) throw new HttpError(400, "Give your event a name.");
  if (draft.title.trim().length > 120)
    throw new HttpError(400, "Keep the name under 120 characters.");
  if (!draft.location?.trim()) throw new HttpError(400, "Add a location.");

  // Dates: valid, end after start, and not in the past (unless unchanged on
  // edit). Resolved in the host's timezone, never the server's.
  if (!LOCAL_DATETIME.test(draft.startsAt ?? ""))
    throw new HttpError(400, "Pick a start date and time.");
  const start = localToInstant(draft.startsAt, draft.timezone);
  const end = draft.endsAt ? localToInstant(draft.endsAt, draft.timezone) : start;
  if (Number.isNaN(start) || Number.isNaN(end))
    throw new HttpError(400, "That date doesn't look right.");
  if (end < start) throw new HttpError(400, "The event can't end before it starts.");
  const datesUnchanged =
    previous && previous.startsAt === draft.startsAt && previous.endsAt === draft.endsAt;
  if (!datesUnchanged && end < Date.now() - GRACE_MS)
    throw new HttpError(400, "That date has already passed — pick an upcoming one.");

  // Media: a bounded list of real image sources; the cover is the first photo.
  if (draft.images != null) {
    if (!Array.isArray(draft.images)) throw new HttpError(400, "images must be a list");
    if (draft.images.length > MAX_IMAGES)
      throw new HttpError(400, `You can add up to ${MAX_IMAGES} photos.`);
    if (!draft.images.every(isImageSrc))
      throw new HttpError(400, "One of the photos is too large or not an image.");
  }
  if (draft.cover != null && !isImageSrc(draft.cover))
    throw new HttpError(400, "The cover is too large or not an image.");
  if (draft.coverPosition != null && !/^\d{1,3}% \d{1,3}%$/.test(draft.coverPosition))
    throw new HttpError(400, "coverPosition must look like '50% 50%'");
  if (draft.thumb != null && !isImageSrc(draft.thumb))
    throw new HttpError(400, "The thumbnail is too large or not an image.");

  // Price: free (null/0) or a sane BOB amount.
  if (draft.price != null) {
    if (typeof draft.price !== "number" || !Number.isFinite(draft.price) || draft.price < 0)
      throw new HttpError(400, "Enter a valid price.");
    if (draft.price > 100_000) throw new HttpError(400, "That price is too high.");
  }
  if (draft.capacity != null && (!Number.isInteger(draft.capacity) || draft.capacity < 1))
    throw new HttpError(400, "Capacity must be a whole number of at least 1.");

  // Content: nothing a public listing shouldn't say.
  const verdict = moderateFields({
    title: draft.title,
    description: draft.description,
    location: draft.location,
  });
  if (!verdict.ok) throw new HttpError(400, verdict.reason);
}

/** Free-text a guest sends (questions, replies, reports). */
export function validateMessage(message: unknown, field = "message"): string {
  const text = typeof message === "string" ? message.trim() : "";
  if (!text) throw new HttpError(400, `${field} is required`);
  if (text.length > 2000) throw new HttpError(400, `${field} is too long`);
  const verdict = moderateFields({ [field]: text });
  if (!verdict.ok) throw new HttpError(400, verdict.reason);
  return text;
}
