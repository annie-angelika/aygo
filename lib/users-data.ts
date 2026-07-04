// The signed-in traveler's base identity. There is NO fake social graph: other
// travelers exist only as real rows in the backend (`travelers` table), and
// event attendees come from real RSVPs (`going` rows). Empty is empty.

import { CURRENT_USER } from "@/lib/events-data";
import type { TravelerProfile } from "@/types";

export const CURRENT_USERNAME = CURRENT_USER.username;

/**
 * Keyed by username — only "you". Zeros and empty lists are honest defaults;
 * the live identity (Pollar) and your saved edits overlay this in
 * `use-traveler` / `use-profile`.
 */
export const USERS: Record<string, TravelerProfile> = {
  [CURRENT_USER.username]: {
    username: CURRENT_USER.username,
    name: CURRENT_USER.name,
    avatar: CURRENT_USER.avatar,
    bio: "",
    location: "La Paz, Bolivia",
    joined: "2026",
    socials: {},
    followers: 0,
    following: 0,
    visits: [],
  },
};

export function findUser(username: string): TravelerProfile | undefined {
  return USERS[username];
}

/**
 * Maps a route stop (visit) to the event it came from. Visits only exist for
 * real traveler rows from the backend; unknown ids simply don't link.
 */
export const VISIT_EVENT: Record<string, string> = {};
