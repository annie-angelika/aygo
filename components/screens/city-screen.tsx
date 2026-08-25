"use client";

import { EventsBoard } from "@/components/discover/events-board";
import { CityHero } from "@/components/city/city-hero";
import { CATEGORIES } from "@/lib/events-data";
import { findCity, withCityMeta } from "@/lib/cities-data";
import { useCities } from "@/hooks/use-discover";
import type { Category } from "@/types";

export function CityScreen({
  slug,
  initialInterest,
}: {
  slug: string;
  initialInterest?: string;
}) {
  // Identity renders instantly from the seed; the live row (with the real,
  // backend-computed event count) replaces it as soon as it loads.
  const { cities } = useCities();
  const live = cities.find((c) => c.slug === slug);
  const city = live ? withCityMeta(live) : findCity(slug);

  if (!city) return null;

  const defaultInterest = (CATEGORIES as string[]).includes(initialInterest ?? "")
    ? (initialInterest as Category)
    : undefined;

  return (
    <div className="flex flex-col gap-4 px-4 pt-3 lg:gap-8 lg:pt-4">
      <CityHero city={city} mapHref={`/${slug}/map`} />
      <EventsBoard defaultInterest={defaultInterest} city={city.name} />
    </div>
  );
}
