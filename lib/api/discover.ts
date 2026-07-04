// Discover content: cities, featured calendars, and per-interest stats. With a
// backend the counts are computed server-side from the real events table
// (created events included); in mock mode we compute the same counts from the
// bundled data so both modes show honest numbers.

import { events } from "@/lib/events-data";
import { CITY_DATA } from "@/lib/cities-data";
import {
  FEATURED_CALENDARS,
  CATEGORY_PAGES,
  citiesWithCounts,
  categoriesWithCounts,
} from "@/lib/discover-data";
import type { CityInfo, CalendarInfo, CategoryStat } from "@/types";
import { api, USE_MOCK } from "@/lib/api/client";

/** The city explorer, with real event counts. → `GET /cities` */
export async function fetchCities(signal?: AbortSignal): Promise<CityInfo[]> {
  if (USE_MOCK) return citiesWithCounts(CITY_DATA, events);
  return api.get<CityInfo[]>("/cities", undefined, signal);
}

/** Featured community calendars. → `GET /calendars` */
export async function fetchCalendars(
  signal?: AbortSignal,
): Promise<CalendarInfo[]> {
  if (USE_MOCK) return FEATURED_CALENDARS;
  return api.get<CalendarInfo[]>("/calendars", undefined, signal);
}

/** Per-interest stats + page copy, with real counts. → `GET /categories` */
export async function fetchCategoryStats(
  signal?: AbortSignal,
): Promise<CategoryStat[]> {
  if (USE_MOCK) return categoriesWithCounts(CATEGORY_PAGES, events);
  return api.get<CategoryStat[]>("/categories", undefined, signal);
}
