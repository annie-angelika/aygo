import { cache } from "react";
import { notFound } from "next/navigation";

import { CITIES, findCity } from "@/lib/cities-data";
import { getStore } from "@/lib/server/store";
import { anchoredCatalogEvents } from "@/lib/server/store/catalog";
import { FEATURED_CALENDARS, findCalendar } from "@/lib/discover-data";
import {
  CATEGORIES,
  findCategory,
  categorySlug,
  events,
  eventCode,
  findEventByCode,
} from "@/lib/events-data";
import { AppShell } from "@/components/layout/app-shell";
import { CityScreen } from "@/components/screens/city-screen";
import { CalendarScreen } from "@/components/screens/calendar-screen";
import { CategoryScreen } from "@/components/screens/category-screen";
import { EventDetail } from "@/components/screens/event-detail";

/**
 * The flat, Luma-style namespace. One short URL — /<slug> — serves a city, a
 * community calendar, an interest, or an event (by its short share code, e.g.
 * /q0gdufts). The slug sets don't overlap, so we resolve by what it matches.
 * Cities/calendars/categories get the app chrome; an event renders full-bleed
 * immersive (its own back button + sticky RSVP), like /create.
 */
/**
 * Guest-created events aren't in the static catalog — when every static lookup
 * misses, ask the store (deduped across metadata + page render). Only unknown
 * slugs reach this, so the static pages stay database-free.
 */
const findCreatedByCode = cache((code: string) =>
  getStore().getEventByCode(code),
);

/**
 * Resolve a seeded event by its share code from the re-anchored catalog, so the
 * detail page shows the same live dates the seeded database (and every list)
 * does — not the raw authoring-time dates frozen in the static array.
 */
const findSeededByCode = cache((code: string) =>
  anchoredCatalogEvents().find((e) => eventCode(e.id) === code),
);

export function generateStaticParams() {
  return [
    ...CITIES.map((c) => ({ slug: c.slug })),
    ...FEATURED_CALENDARS.map((c) => ({ slug: c.id })),
    ...CATEGORIES.map((c) => ({ slug: categorySlug(c) })),
    ...events.map((e) => ({ slug: eventCode(e.id) })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const name =
    findCity(slug)?.name ??
    findCalendar(slug)?.name ??
    findCategory(slug) ??
    findEventByCode(slug)?.title ??
    (await findCreatedByCode(slug))?.title;
  return name ? { title: name } : { title: { absolute: "aygo" } };
}

export default async function SlugPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ interest?: string }>;
}) {
  const { slug } = await params;

  if (findCity(slug)) {
    const { interest } = await searchParams;
    return (
      <AppShell>
        <CityScreen slug={slug} initialInterest={interest} />
      </AppShell>
    );
  }

  if (findCalendar(slug)) {
    return (
      <AppShell>
        <CalendarScreen id={slug} />
      </AppShell>
    );
  }

  const category = findCategory(slug);
  if (category) {
    return (
      <AppShell>
        <CategoryScreen category={category} />
      </AppShell>
    );
  }

  // Seeded events resolve from the re-anchored catalog (live dates, refreshed
  // when-fields); guest-created events come from the store already fresh.
  const event = findSeededByCode(slug) ?? (await findCreatedByCode(slug));
  if (event) {
    return (
      <main className="mx-auto min-h-svh w-full max-w-md bg-[#f6f4ef]">
        <EventDetail event={event} />
      </main>
    );
  }

  notFound();
}
