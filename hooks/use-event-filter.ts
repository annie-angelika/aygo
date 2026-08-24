"use client";

import { useState } from "react";

import { useEvents } from "@/hooks/use-events";
import { cityKey } from "@/lib/utils";
import type { AygoEvent, Category } from "@/types";

export type When = "upcoming" | "past";
export type DateRange = "any" | "today" | "week" | "month";
export type PriceFilter = "any" | "free" | "paid";

/** The user-adjustable filters beyond Upcoming/Past + interest. */
export type ExtraFilters = {
  city: string | "all";
  range: DateRange;
  price: PriceFilter;
  query: string;
};

export const DEFAULT_EXTRA: ExtraFilters = { city: "all", range: "any", price: "any", query: "" };

/** How many of the extra filters are off their default (for the button badge). */
export function activeFilterCount(f: ExtraFilters): number {
  return (
    (f.city !== "all" ? 1 : 0) +
    (f.range !== "any" ? 1 : 0) +
    (f.price !== "any" ? 1 : 0)
  );
}

function inRange(e: AygoEvent, range: DateRange, now: Date): boolean {
  if (range === "any") return true;
  const start = new Date(e.startsAt);
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const limit = new Date(dayStart);
  if (range === "today") limit.setDate(limit.getDate() + 1);
  else if (range === "week") limit.setDate(limit.getDate() + 7);
  else limit.setMonth(limit.getMonth() + 1);
  return start < limit;
}

function matches(e: AygoEvent, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [e.title, e.place, e.city, e.host.name, e.category, e.blurb]
    .join(" ")
    .toLowerCase()
    .includes(q);
}

/**
 * Shared event-filter state for the events list and the map: Upcoming/Past +
 * interest, applied to the live event feed. `category` locks the interest
 * (category pages); `defaultInterest` just preselects it; `upcomingOnly` drops
 * the past option (agenda variant); `city` scopes to one city's events (city
 * pages). `extra` adds the user-facing city / date-range / price / search
 * filters (the Discover board). Returns the filtered, sorted list.
 */
export function useEventFilter(
  opts: {
    category?: Category;
    defaultInterest?: Category;
    upcomingOnly?: boolean;
    city?: string;
  } = {},
) {
  const { category, defaultInterest, upcomingOnly, city } = opts;
  const { data, loading } = useEvents();
  const [when, setWhen] = useState<When>("upcoming");
  const [interest, setInterest] = useState<Category | "all">(
    category ?? defaultInterest ?? "all",
  );
  const [extra, setExtra] = useState<ExtraFilters>(DEFAULT_EXTRA);

  const past = !upcomingOnly && when === "past";
  const active = category ?? interest;
  const now = new Date();
  const filtered = data
    .filter((e) => (past ? e.isPast : !e.isPast))
    .filter((e) => active === "all" || e.category === active)
    .filter((e) => !city || cityKey(e.city) === cityKey(city))
    .filter((e) => extra.city === "all" || cityKey(e.city) === cityKey(extra.city))
    .filter((e) => past || inRange(e, extra.range, now))
    .filter(
      (e) =>
        extra.price === "any" ||
        (extra.price === "free" ? !(e.price != null && e.price > 0) : e.price != null && e.price > 0),
    )
    .filter((e) => matches(e, extra.query))
    .sort((a, b) =>
      past
        ? b.startsAt.localeCompare(a.startsAt)
        : a.startsAt.localeCompare(b.startsAt),
    );

  return {
    loading,
    when,
    setWhen,
    interest,
    setInterest,
    past,
    active,
    filtered,
    extra,
    setExtra,
    /** Clear the chip filters but keep what the user typed in search. */
    resetExtra: () => setExtra((f) => ({ ...DEFAULT_EXTRA, query: f.query })),
  };
}
