"use client";

import { useRegistrations } from "@/hooks/use-registrations";
import { useProfileEdits } from "@/hooks/use-profile";
import { USERS, findUser, CURRENT_USERNAME } from "@/lib/users-data";
import type { Stamp } from "@/types";

/**
 * Resolves a traveler profile by username, merging your local edits when it's
 * you, and the stamps to display (your collected ones, or theirs from routes).
 */
export function useTraveler(username?: string) {
  const { stamps } = useRegistrations();
  const { edits } = useProfileEdits();
  const base = findUser(username ?? CURRENT_USERNAME) ?? USERS[CURRENT_USERNAME];
  const isSelf = base.username === CURRENT_USERNAME;
  const user = isSelf ? { ...base, ...edits } : base;

  const displayStamps: Stamp[] = isSelf
    ? stamps
    : user.visits.map((v) => ({
        eventId: v.id,
        title: v.place,
        category: v.category,
        image: v.cover,
      }));

  return { user, isSelf, displayStamps };
}
