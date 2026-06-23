"use client";

import { useState } from "react";

import { useEvents } from "@/hooks/use-events";
import type { Category } from "@/types";

export type When = "upcoming" | "past";

/**
 * Shared event-filter state for the events list and the map: Upcoming/Past +
 * interest, applied to the (mock) event feed. `category` locks the interest
 * (category pages); `defaultInterest` just preselects it; `upcomingOnly` drops
 * the past option (agenda variant). Returns the filtered, sorted list.
 */
export function useEventFilter(
  opts: {
    category?: Category;
    defaultInterest?: Category;
    upcomingOnly?: boolean;
  } = {},
) {
  const { category, defaultInterest, upcomingOnly } = opts;
  const { data, loading } = useEvents();
  const [when, setWhen] = useState<When>("upcoming");
  const [interest, setInterest] = useState<Category | "all">(
    category ?? defaultInterest ?? "all",
  );

  const past = !upcomingOnly && when === "past";
  const active = category ?? interest;
  const filtered = data
    .filter((e) => (past ? e.isPast : !e.isPast))
    .filter((e) => active === "all" || e.category === active)
    .sort((a, b) =>
      past
        ? b.startsAt.localeCompare(a.startsAt)
        : a.startsAt.localeCompare(b.startsAt),
    );

  return { loading, when, setWhen, interest, setInterest, past, active, filtered };
}
