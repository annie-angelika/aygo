// GET /api/events       → the catalog
// POST /api/events      → create (or re-sync/edit) the guest's own event

import { getStore } from "@/lib/server/store";
import { getSessionId } from "@/lib/server/session";
import { geocode, scopeForCity } from "@/lib/server/geocode";
import { validateDraft } from "@/lib/server/validate-draft";
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

  const previous = owner
    ? (await store.listMyEvents(sid)).find((d) => d.id === draft.id) ?? null
    : null;
  validateDraft(draft, previous);
  // The cover is always the first photo — keep the two in step however the
  // client filled them. A stale thumb (cover changed) is dropped.
  if (draft.images?.length) draft.cover = draft.images[0];
  if (draft.thumb && previous && previous.cover !== draft.cover && draft.thumb === previous.thumb)
    delete draft.thumb;
  // Host identity overrides are admin-only (set from /admin); a host can't
  // relabel themselves through the API.
  draft.hostName = previous?.hostName;
  draft.hostPhone = previous?.hostPhone;

  // Pin the event on the real map: geocode its free-text location once, at
  // write time, bounded to the chosen city so the pin lands in the right place
  // instead of a same-named venue elsewhere. Skipped when the picker already
  // supplied coordinates from a selected search result.
  if (draft.lat == null || draft.lng == null) {
    const scope = scopeForCity(draft.city);
    const withCity = draft.city ? `${draft.location}, ${draft.city}` : null;
    const coords =
      (withCity ? await geocode(withCity, scope) : null) ??
      (await geocode(draft.location, scope ?? { countryCode: "bo" }));
    if (coords) {
      draft.lat = coords.lat;
      draft.lng = coords.lng;
    }
  }
  await store.createEvent(sid, draft);
  return json(draft, 201);
});
