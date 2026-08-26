// The signed-in user's editable profile (name, bio, location, avatar, socials)
// and their public handle. Local-first: `use-profile` persists edits to
// localStorage instantly; this pushes them to the backend. `fetchProfile`
// hydrates the local cache on load (it carries `username` too).

import type { ProfileEdits } from "@/types";
import { api } from "@/lib/api/client";

/** Load the user's saved profile (edits + username) to seed the local cache. → `GET /me/profile` */
export async function fetchProfile(
  signal?: AbortSignal,
): Promise<Partial<ProfileEdits>> {
  return api.get<Partial<ProfileEdits>>("/me/profile", undefined, signal);
}

/** Persist profile edits (the server ignores `username` here). → `PUT /me/profile` */
export async function saveProfile(edits: ProfileEdits): Promise<void> {
  await api.put("/me/profile", edits);
}

/**
 * Claim or change your public handle. Resolves the normalized username;
 * throws an `ApiError` 409 when taken, 400 with the reason when invalid.
 * → `PUT /me/username`
 */
export async function setUsername(username: string): Promise<string> {
  const { username: saved } = await api.put<{ username: string }>("/me/username", { username });
  return saved;
}

/** Is this handle free (or already yours)? → `GET /usernames/:username` */
export async function checkUsername(
  username: string,
  signal?: AbortSignal,
): Promise<{ username: string; available: boolean }> {
  return api.get(`/usernames/${encodeURIComponent(username)}`, undefined, signal);
}
