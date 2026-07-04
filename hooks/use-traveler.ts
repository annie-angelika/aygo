"use client";

import { useAsyncData } from "@/hooks/use-async-data";
import { useRegistrations } from "@/hooks/use-registrations";
import { useProfileEdits } from "@/hooks/use-profile";
import { useAuth } from "@/hooks/use-auth";
import { fetchTraveler } from "@/lib/api";
import { USERS, findUser, CURRENT_USERNAME } from "@/lib/users-data";
import type { Stamp } from "@/types";

/**
 * Resolves a traveler profile by username. Yourself is assembled locally:
 * base identity ← signed-in social profile (Pollar) ← saved profile edits,
 * plus your collected aygos. Anyone else comes from the backend
 * (`GET /users/:username`) — and if they don't exist there, `user` is `null`;
 * nothing is ever invented.
 */
export function useTraveler(username?: string) {
  const { stamps } = useRegistrations();
  const { edits } = useProfileEdits();
  const auth = useAuth();

  const target = username ?? CURRENT_USERNAME;
  const isSelf = target === CURRENT_USERNAME;

  const { data: remote, loading } = useAsyncData(
    (signal) => fetchTraveler(target, signal),
    [target],
    { cacheKey: `traveler:${target}`, enabled: !isSelf },
  );

  const user = isSelf
    ? {
        ...(findUser(CURRENT_USERNAME) ?? USERS[CURRENT_USERNAME]),
        ...(auth.name ? { name: auth.name } : null),
        ...(auth.avatar ? { avatar: auth.avatar } : null),
        ...edits,
      }
    : (remote ?? null);

  const displayStamps: Stamp[] = isSelf
    ? stamps
    : (user?.visits ?? []).map((v) => ({
        eventId: v.id,
        title: v.place,
        category: v.category,
        image: v.cover,
      }));

  return { user, isSelf, displayStamps, loading: !isSelf && loading };
}
