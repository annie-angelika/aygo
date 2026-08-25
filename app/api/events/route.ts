// GET /api/events       → the catalog
// POST /api/events      → create (or re-sync/edit) the guest's own event

import { getStore } from "@/lib/server/store";
import { getSessionId } from "@/lib/server/session";
import { geocode, scopeForCity, searchSettlements } from "@/lib/server/geocode";
import { findCityByName } from "@/lib/cities-seed";
import { slugify } from "@/lib/server/store/draft-event";
import { parseDraft } from "@/lib/server/validate-draft";
import { rateLimit, LIMITS } from "@/lib/server/rate-limit";
import { dedupeKey } from "@/lib/server/validate";
import { handler, json, readJson, HttpError } from "@/lib/server/http";

/** Photos ride inline as base64, so this body is allowed to be big. */
const EVENT_BODY_BYTES = 10 * 1024 * 1024;
/** Durable anti-spam quotas, enforced against the store (survive restarts). */
const MAX_EVENTS_PER_DAY = 10;
const MAX_EVENTS_TOTAL = 60;

export const GET = handler(async () => {
  return json(await getStore().listEvents());
});

export const POST = handler(async (req: Request) => {
  const sid = await getSessionId();
  const raw = await readJson<{ id?: unknown }>(req, EVENT_BODY_BYTES);
  const id = typeof raw?.id === "string" ? raw.id : "";
  if (!id) throw new HttpError(400, "id is required");

  // Upserts are owner-only: you can re-sync/edit YOUR event, never someone
  // else's, and never shadow a catalog event's id.
  const store = getStore();
  const owner = await store.getEventOwner(id);
  if (owner && owner !== sid) throw new HttpError(403, "This event belongs to another host");
  if (!owner && (await store.getEvent(id))) throw new HttpError(409, "That id is taken");

  const mine = await store.listMyEvents(sid);
  const previous = owner ? (mine.find((d) => d.id === id) ?? null) : null;
  rateLimit(req, previous ? "event:edit" : "event:create", sid, previous ? LIMITS.editEvent : LIMITS.createEvent);

  const draft = parseDraft(raw, previous);

  if (!previous) {
    // Quotas: bursts (per hour, above) plus per-day and lifetime caps, and no
    // near-duplicates of an event you already host.
    if ((await store.countRecentEvents(sid, 86_400_000)) >= MAX_EVENTS_PER_DAY)
      throw new HttpError(429, `You can create up to ${MAX_EVENTS_PER_DAY} events per day.`);
    if (mine.length >= MAX_EVENTS_TOTAL)
      throw new HttpError(429, "You've reached the limit of events you can host. Delete an old one first.");
    const key = dedupeKey(draft.title);
    if (mine.some((d) => dedupeKey(d.title) === key && d.startsAt.slice(0, 10) === draft.startsAt.slice(0, 10)))
      throw new HttpError(409, "You already have an event with this name on that day.");
  }

  // A city the seed doesn't know (the host typed or picked "another city"):
  // resolve it to a real Bolivian town once and store it, so it gets its own
  // page and shows up in the explorer as soon as it has events.
  if (draft.city && !findCityByName(draft.city)) {
    const known = (await store.listCities()).find(
      (c) => c.name.toLowerCase() === draft.city!.toLowerCase(),
    );
    if (known) {
      draft.city = known.name;
    } else {
      const [town] = await searchSettlements(draft.city, 1);
      if (!town) throw new HttpError(400, "We couldn't find that city in Bolivia — check the spelling.");
      const slug = slugify(town.name);
      await store.upsertCity({
        slug,
        name: town.name,
        country: "Bolivia",
        countryCode: "bo",
        region: "South America",
        lat: town.lat,
        lng: town.lng,
        bbox: town.bbox,
        ...(town.state ? { tagline: `Events around ${town.name}, ${town.state}.` } : null),
      });
      draft.city = town.name;
    }
  }

  // Pin the event on the real map: geocode its free-text location once, at
  // write time, bounded to the chosen city so the pin lands in the right place
  // instead of a same-named venue elsewhere. Skipped when the picker already
  // supplied coordinates from a selected search result (or nothing changed).
  const sameSpot = previous && previous.location === draft.location && previous.city === draft.city;
  if (draft.lat == null || draft.lng == null) {
    if (sameSpot && previous.lat != null && previous.lng != null) {
      draft.lat = previous.lat;
      draft.lng = previous.lng;
    } else {
      // A seeded city has a scope; a city added on the fly is bounded by the
      // box we stored for it when it was created.
      const stored = draft.city && !findCityByName(draft.city)
        ? (await store.listCities()).find((c) => c.name === draft.city)
        : undefined;
      const scope = stored
        ? { countryCode: stored.countryCode ?? "bo", bbox: stored.bbox, aliases: [stored.name, "bolivia"] }
        : scopeForCity(draft.city);
      const withCity = draft.city ? `${draft.location}, ${draft.city}` : null;
      const coords =
        (withCity ? await geocode(withCity, scope) : null) ??
        (await geocode(draft.location, scope ?? { countryCode: "bo" }));
      if (coords) {
        draft.lat = coords.lat;
        draft.lng = coords.lng;
      }
    }
  }
  await store.createEvent(sid, draft);
  return json(draft, 201);
});
