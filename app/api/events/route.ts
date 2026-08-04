// GET /api/events       → the catalog
// POST /api/events      → create an event (the guest's draft)

import { getStore } from "@/lib/server/store";
import { getSessionId } from "@/lib/server/session";
import { geocode } from "@/lib/server/geocode";
import { handler, json, readJson, HttpError } from "@/lib/server/http";
import type { EventDraft } from "@/lib/create-event";

export const GET = handler(async () => {
  return json(await getStore().listEvents());
});

export const POST = handler(async (req: Request) => {
  const sid = await getSessionId();
  const draft = await readJson<EventDraft>(req);
  if (!draft.id) throw new HttpError(400, "id is required");

  // Upserts are owner-only: you can re-sync/edit YOUR event, never someone
  // else's, and never shadow a catalog event's id.
  const store = getStore();
  const owner = await store.getEventOwner(draft.id);
  if (owner && owner !== sid)
    throw new HttpError(403, "This event belongs to another host");
  if (!owner && (await store.getEvent(draft.id)))
    throw new HttpError(409, "That id is taken");
  // Pin the event on the real map: geocode its free-text location once, at
  // write time. Anchor to the chosen city (then Bolivia) so the pin lands in the
  // right place instead of a same-named venue elsewhere. Skipped when the picker
  // already supplied coordinates from a selected search result.
  if (draft.lat == null || draft.lng == null) {
    const withCity = draft.city ? `${draft.location}, ${draft.city}` : null;
    const coords =
      (withCity ? await geocode(withCity) : null) ??
      (await geocode(`${draft.location}, Bolivia`)) ??
      (await geocode(draft.location));
    if (coords) {
      draft.lat = coords.lat;
      draft.lng = coords.lng;
    }
  }
  await store.createEvent(sid, draft);
  return json(draft, 201);
});
