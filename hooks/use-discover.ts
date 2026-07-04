"use client";

// Discover data hooks: cities, featured calendars, and per-interest stats —
// all backed by `@/lib/api` (real counts from the backend) and cached
// stale-while-revalidate like `useEvents`.

import { useAsyncData } from "@/hooks/use-async-data";
import { fetchCities, fetchCalendars, fetchCategoryStats } from "@/lib/api";
import type { CityInfo, CalendarInfo, CategoryStat, Category } from "@/types";

const NO_CITIES: CityInfo[] = [];
const NO_CALENDARS: CalendarInfo[] = [];
const NO_STATS: CategoryStat[] = [];

export function useCities() {
  const { data, loading, error } = useAsyncData(
    (signal) => fetchCities(signal),
    [],
    { cacheKey: "cities" },
  );
  return { cities: data ?? NO_CITIES, loading, error };
}

export function useCalendars() {
  const { data, loading, error, refetch } = useAsyncData(
    (signal) => fetchCalendars(signal),
    [],
    { cacheKey: "calendars" },
  );
  return { calendars: data ?? NO_CALENDARS, loading, error, refetch };
}

export function useCategoryStats() {
  const { data, loading, error } = useAsyncData(
    (signal) => fetchCategoryStats(signal),
    [],
    { cacheKey: "category-stats" },
  );
  return { stats: data ?? NO_STATS, loading, error };
}

/** The stats row for one interest (category page header). */
export function useCategoryStat(category: Category) {
  const { stats, loading, error } = useCategoryStats();
  return { stat: stats.find((s) => s.category === category), loading, error };
}
