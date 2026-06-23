"use client";

import { useState } from "react";

import { EventsBoard } from "@/components/discover/events-board";
import { CityHero } from "@/components/city/city-hero";
import { CATEGORIES } from "@/lib/events-data";
import { findCity } from "@/lib/cities-data";
import type { Category } from "@/types";

export function CityScreen({
  slug,
  initialInterest,
}: {
  slug: string;
  initialInterest?: string;
}) {
  const city = findCity(slug);
  const [subscribed, setSubscribed] = useState(Boolean(city?.subscribed));

  if (!city) return null;

  const defaultInterest = (CATEGORIES as string[]).includes(initialInterest ?? "")
    ? (initialInterest as Category)
    : undefined;

  return (
    <div className="flex flex-col gap-4 px-4 pt-3">
      <CityHero
        city={city}
        subscribed={subscribed}
        onToggleSubscribe={() => setSubscribed((s) => !s)}
        mapHref={`/${slug}/map`}
      />
      <EventsBoard defaultInterest={defaultInterest} />
    </div>
  );
}
