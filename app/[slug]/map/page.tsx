import { cache } from "react";
import { notFound } from "next/navigation";

import { CITIES, findCity } from "@/lib/cities-data";
import { getStore } from "@/lib/server/store";
import { CityMapScreen } from "@/components/screens/city-map-screen";
import { CalendarMapScreen } from "@/components/screens/calendar-map-screen";

/**
 * The map view exists for cities and community calendars, at /<slug>/map. It's a
 * full-screen immersive page (its own back button, no top bar) so the map and
 * filters can stay pinned while only the event list scrolls.
 */
export function generateStaticParams() {
  return CITIES.map((c) => ({ slug: c.slug }));
}

/** Cities hosts added on the fly live in the store (see /[slug]). */
const findCityInStore = cache(async (slug: string) =>
  findCity(slug) ? undefined : (await getStore().listCities()).find((c) => c.slug === slug),
);

/** Calendars are curated in the admin and live in the store (see /[slug]). */
const findCalendarInStore = cache(async (id: string) =>
  (await getStore().listCalendars()).find((c) => c.id === id),
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const name =
    findCity(slug)?.name ??
    (await findCityInStore(slug))?.name ??
    (await findCalendarInStore(slug))?.name;
  return name ? { title: `${name} map` } : { title: { absolute: "aygo" } };
}

export default async function MapPage({
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
    return <CityMapScreen slug={slug} initialInterest={interest} initial={storedCity} />;
  }

  const calendar = await findCalendarInStore(slug);
  if (calendar) {
    return <CalendarMapScreen calendar={calendar} />;
  }

  notFound();
}
