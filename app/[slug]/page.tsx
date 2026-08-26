import { cache } from "react";
import { notFound } from "next/navigation";

import { CITIES, findCity } from "@/lib/cities-data";
import { getStore } from "@/lib/server/store";
import { CATEGORIES, findCategory, categorySlug } from "@/lib/events-data";
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
 * Resolve an event by its share code from the store, so the detail page reads
 * the exact same row — and the same dates — as the lists do. `cache` dedupes
 * the lookup across metadata + render.
 */
const findEventByCodeInStore = cache((code: string) =>
  getStore().getEventByCode(code),
);

/**
 * Community calendars are curated in the admin and live in the store, so a
 * calendar the operator added five minutes ago gets its page right away.
 */
const findCalendarInStore = cache(async (id: string) =>
  (await getStore().listCalendars()).find((c) => c.id === id),
);

/** Cities hosts added on the fly live in the store; seeded ones resolve statically. */
const findCityInStore = cache(async (slug: string) =>
  findCity(slug) ? undefined : (await getStore().listCities()).find((c) => c.slug === slug),
);

/** Cities and interests are known at build time; events are live rows. */
export function generateStaticParams() {
  return [
    ...CITIES.map((c) => ({ slug: c.slug })),
    ...CATEGORIES.map((c) => ({ slug: categorySlug(c) })),
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
    (await findCityInStore(slug))?.name ??
    findCategory(slug) ??
    (await findCalendarInStore(slug))?.name ??
    (await findEventByCodeInStore(slug))?.title;
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

  const storedCity = await findCityInStore(slug);
  if (findCity(slug) || storedCity) {
    const { interest } = await searchParams;
    return (
      <AppShell>
        <CityScreen slug={slug} initialInterest={interest} initial={storedCity} />
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

  const calendar = await findCalendarInStore(slug);
  if (calendar) {
    return (
      <AppShell>
        <CalendarScreen id={slug} initial={calendar} />
      </AppShell>
    );
  }

  // Events resolve from the store, so the detail always matches the lists.
  const event = await findEventByCodeInStore(slug);
  if (event) {
    return (
      <main className="mx-auto min-h-svh w-full max-w-md bg-[#f6f4ef] lg:max-w-none">
        <EventDetail event={event} />
      </main>
    );
  }

  notFound();
}
