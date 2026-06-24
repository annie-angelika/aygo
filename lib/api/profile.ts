// The signed-in user's editable profile (name, bio, location, avatar, socials).
// Local-first: `use-profile` persists edits to localStorage instantly; this
// pushes them to the backend. `fetchProfile` hydrates the local cache on load.

import type { ProfileEdits } from "@/types";
import { api, USE_MOCK } from "@/lib/api/client";

/**
 * Load the user's saved profile edits to seed the local cache.
 * Returns `null` in mock mode. → `GET /me/profile`
 */
export async function fetchProfile(
  signal?: AbortSignal,
): Promise<Partial<ProfileEdits> | null> {
  if (USE_MOCK) return null;
  return api.get<Partial<ProfileEdits>>("/me/profile", undefined, signal);
}

/** Persist profile edits. → `PUT /me/profile` */
export async function saveProfile(edits: ProfileEdits): Promise<void> {
  if (USE_MOCK) return;
  await api.put("/me/profile", edits);
}
