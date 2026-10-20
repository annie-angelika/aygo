// POST /api/admin/events → create or update a catalog event. Admin only.
// Derived fields (day labels, isPast) are computed server-side from startsAt.
// Admins are trusted, but their input is still shape-checked so a typo can't
// corrupt the catalog (and the cover must be a real https image URL).

import { getStore } from "@/lib/server/store";
import { requireAdmin } from "@/lib/server/admin";
import { geocode, scopeForCity } from "@/lib/server/geocode";
import { expectObject, str, optStr, optNum, enumOf, httpsUrl, SLUG } from "@/lib/server/validate";
import { handler, json, readJson, HttpError } from "@/lib/server/http";
import { normalizeWhatsapp } from "@/lib/payment";
import { CATEGORIES } from "@/lib/events-data";
import type { AdminEventInput } from "@/lib/server/store/types";

const DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

/** Every event, private ones included — the admin's manage list. */
export const GET = handler(async (req: Request) => {
  await requireAdmin(req);
  return json(await getStore().listAllEvents());
});

export const POST = handler(async (req: Request) => {
  await requireAdmin(req);
  const b = expectObject(await readJson<unknown>(req, 256 * 1024), "event");
  const input: AdminEventInput = {
    id: optStr(b.id, "id", { max: 64, pattern: SLUG }),
    title: str(b.title, "title", { max: 120 }),
    category: enumOf(b.category, "category", CATEGORIES),
    city: str(b.city, "city", { max: 60 }),
    place: str(b.place, "place", { max: 160 }),
    startsAt: str(b.startsAt, "startsAt", { max: 19, pattern: DATETIME }),
    price: optNum(b.price, "price", { min: 0, max: 100_000 }) ?? null,
    blurb: optStr(b.blurb, "blurb", { max: 4000, multiline: true }) ?? "",
    lat: optNum(b.lat, "lat", { min: -90, max: 90 }),
    lng: optNum(b.lng, "lng", { min: -180, max: 180 }),
    cover: (() => {
      const c = optStr(b.cover, "cover", { max: 1024 });
      return c ? httpsUrl(c, "cover") : undefined;
    })(),
    hostName: optStr(b.hostName, "hostName", { max: 80 }),
    hostPhone: optStr(b.hostPhone, "hostPhone", { max: 20, pattern: /^\+?[0-9 ()-]{6,20}$/ }),
    payWhatsapp: (() => {
      const raw = optStr(b.payWhatsapp, "payWhatsapp", { max: 25 });
      if (!raw) return undefined;
      const n = normalizeWhatsapp(raw);
      if (!n) throw new HttpError(400, "payWhatsapp doesn't look like a phone number");
      return n;
    })(),
    payLink: (() => {
      const l = optStr(b.payLink, "payLink", { max: 2048 });
      return l ? httpsUrl(/^https?:\/\//i.test(l) ? l : `https://${l}`, "payLink") : undefined;
    })(),
  };
  if (input.price != null && input.price > 0 && !input.payWhatsapp && !input.payLink)
    throw new HttpError(400, "Paid event: add payWhatsapp or payLink so guests can pay.");

  // No coordinates from the form → geocode the venue once, at write time,
  // bounded to the city when we know it.
  if (input.lat == null || input.lng == null) {
    const coords = await geocode(`${input.place}, ${input.city}`, scopeForCity(input.city));
    if (coords) {
      input.lat = coords.lat;
      input.lng = coords.lng;
    }
  }

  return json(await getStore().upsertEvent(input), input.id ? 200 : 201);
});
