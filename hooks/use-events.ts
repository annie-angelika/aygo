"use client";

import { useAsyncData } from "@/hooks/use-async-data";
import { fetchEvents } from "@/lib/api";
import type { AygoEvent } from "@/types";

const NO_EVENTS: AygoEvent[] = [];

/**
 * The event catalog, from `@/lib/api`, cached stale-while-revalidate so
 * navigating back to a list is instant.
 */
export function useEvents() {
  const { data, loading, error, refetch } = useAsyncData(
    (signal) => fetchEvents(signal),
    [],
    { cacheKey: "events" },
  );
  return { data: data ?? NO_EVENTS, loading, error, refetch };
}
