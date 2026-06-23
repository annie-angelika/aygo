import { notFound } from "next/navigation";

import { CITIES, findCity } from "@/lib/cities-data";
import { FEATURED_CALENDARS, findCalendar } from "@/lib/discover-data";
import { CATEGORIES, findCategory, categorySlug } from "@/lib/events-data";
import { CityScreen } from "@/components/screens/city-screen";
import { CalendarScreen } from "@/components/screens/calendar-screen";
import { CategoryScreen } from "@/components/screens/category-screen";

/**
 * Flat, Luma-style entry point: one short URL — /<slug> — serves a city, a
 * community calendar or an interest, resolved by what the slug matches (in that
 * order; the three slug sets don't overlap). Keeps URLs minimal (e.g. /music,
 * /andes-outdoors, /cochabamba) instead of /discover/category/music etc.
 */
export function generateStaticParams() {
  return [
    ...CITIES.map((c) => ({ slug: c.slug })),
    ...FEATURED_CALENDARS.map((c) => ({ slug: c.id })),
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
    findCity(slug)?.name ?? findCalendar(slug)?.name ?? findCategory(slug);
  return { title: name ? `aygo — ${name}` : "aygo" };
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
    return <CityScreen slug={slug} initialInterest={interest} />;
  }
  if (findCalendar(slug)) return <CalendarScreen id={slug} />;

  const category = findCategory(slug);
  if (category) return <CategoryScreen category={category} />;

  notFound();
}
