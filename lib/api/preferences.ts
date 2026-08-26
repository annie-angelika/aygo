// App preferences (interests + home city). Local-first:
// `use-preferences` persists every change to localStorage instantly; this pushes
// it to the backend. `fetchPreferences` hydrates the local cache on load.

import type { Preferences } from "@/types";
import { api } from "@/lib/api/client";

/** Load saved preferences to seed the local cache (null when none saved). → `GET /me/preferences` */
export async function fetchPreferences(
  signal?: AbortSignal,
): Promise<Preferences | null> {
  return api.get<Preferences>("/me/preferences", undefined, signal);
}

/** Persist preferences. → `PUT /me/preferences` */
export async function savePreferences(prefs: Preferences): Promise<void> {
  await api.put("/me/preferences", prefs);
}
