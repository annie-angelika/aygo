import { notFound } from "next/navigation";

import { CITIES, findCity } from "@/lib/cities-data";
import { FEATURED_CALENDARS, findCalendar } from "@/lib/discover-data";
import {
  CATEGORIES,
  findCategory,
  categorySlug,
  events,
  eventCode,
} from "@/lib/events-data";
import { fetchEventByCode } from "@/lib/api/events";
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
    (await fetchEventByCode(slug))?.title;
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

  const event = await fetchEventByCode(slug);
  if (event) {
    return (
      <main className="mx-auto min-h-svh w-full max-w-md bg-[#f6f4ef]">
        <EventDetail event={event} />
      </main>
    );
  }

  notFound();
}
