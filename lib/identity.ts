// The signed-in person as the app shows them, resolved in ONE place with one
// precedence: your explicit profile edits win, then the social login (Pollar),
// then a neutral fallback. Every surface that names you (top bar, profile,
// settings form, the registration sheet) goes through this so they never
// disagree.

import type { ProfileEdits } from "@/types";

/** What `useAuth()` contributes — kept structural so this stays hook-free. */
export type AuthIdentity = { name: string | null; avatar: string | null };

export type Identity = Omit<ProfileEdits, "username"> & { username: string | null };

/** Neutral defaults: initials-only avatar, nothing invented. */
export const FALLBACK_NAME = "You";

export function resolveIdentity(
  edits: Partial<ProfileEdits>,
  auth: AuthIdentity,
): Identity {
  return {
    name: edits.name ?? auth.name ?? FALLBACK_NAME,
    avatar: edits.avatar ?? auth.avatar ?? "",
    bio: edits.bio ?? "",
    location: edits.location ?? "",
    socials: edits.socials ?? {},
    username: edits.username ?? null,
  };
}
