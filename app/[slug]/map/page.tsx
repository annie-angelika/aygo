import { notFound } from "next/navigation";

import { CITIES, findCity } from "@/lib/cities-data";
import { FEATURED_CALENDARS, findCalendar } from "@/lib/discover-data";
import { CityMapScreen } from "@/components/screens/city-map-screen";
import { CalendarMapScreen } from "@/components/screens/calendar-map-screen";

/**
 * The map view exists for cities and community calendars, at /<slug>/map. It's a
 * full-screen immersive page (its own back button, no top bar) so the map and
 * filters can stay pinned while only the event list scrolls.
 */
export function generateStaticParams() {
  return [
    ...CITIES.map((c) => ({ slug: c.slug })),
    ...FEATURED_CALENDARS.map((c) => ({ slug: c.id })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const name = findCity(slug)?.name ?? findCalendar(slug)?.name;
  return { title: name ? `aygo — ${name} map` : "aygo" };
}

export default async function MapPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ interest?: string }>;
}) {
  const { slug } = await params;

  if (findCity(slug)) {
    const { interest } = await searchParams;
    return <CityMapScreen slug={slug} initialInterest={interest} />;
  }

  if (findCalendar(slug)) {
    return <CalendarMapScreen id={slug} />;
  }

  notFound();
}
