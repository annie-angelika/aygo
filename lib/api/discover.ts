// Discover content: cities, featured calendars, and per-interest stats. Counts
// are computed server-side from the real events table (created events included).

import type { CityInfo, CalendarInfo, CategoryStat } from "@/types";
import { api } from "@/lib/api/client";

/** The city explorer, with real event counts. → `GET /cities` */
export async function fetchCities(signal?: AbortSignal): Promise<CityInfo[]> {
  return api.get<CityInfo[]>("/cities", undefined, signal);
}

/** Featured community calendars. → `GET /calendars` */
export async function fetchCalendars(
  signal?: AbortSignal,
): Promise<CalendarInfo[]> {
  return api.get<CalendarInfo[]>("/calendars", undefined, signal);
}

/** Per-interest stats + page copy, with real counts. → `GET /categories` */
export async function fetchCategoryStats(
  signal?: AbortSignal,
): Promise<CategoryStat[]> {
  return api.get<CategoryStat[]>("/categories", undefined, signal);
}
