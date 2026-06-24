// App preferences (theme, language, notification channels). Local-first:
// `use-preferences` persists every change to localStorage instantly; this pushes
// it to the backend. `fetchPreferences` hydrates the local cache on load.

import type { Preferences } from "@/types";
import { api, USE_MOCK } from "@/lib/api/client";

/**
 * Load saved preferences to seed the local cache.
 * Returns `null` in mock mode. → `GET /me/preferences`
 */
export async function fetchPreferences(
  signal?: AbortSignal,
): Promise<Preferences | null> {
  if (USE_MOCK) return null;
  return api.get<Preferences>("/me/preferences", undefined, signal);
}

/** Persist preferences. → `PUT /me/preferences` */
export async function savePreferences(prefs: Preferences): Promise<void> {
  if (USE_MOCK) return;
  await api.put("/me/preferences", prefs);
}
