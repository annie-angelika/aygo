"use client";

import { useCallback } from "react";
import { readStorage, STORAGE_KEYS, writeStorage } from "@/lib/storage";
import { useStorageValue, useHydrated } from "@/hooks/use-storage";
import type { UserProfile } from "@/types";

export const DEFAULT_PROFILE: UserProfile = {
  name: "A. Álvarez",
  country: "Bolivia",
  language: "es",
  age: 28,
  interests: ["Naturaleza", "Aventura", "Cultura"],
  budget: "medio",
  tripType: "pareja",
  accessibility: false,
  startDate: null,
  endDate: null,
};

export function useProfile() {
  // Server snapshot is DEFAULT_PROFILE so the SSR HTML matches the first client
  // render; useStorageValue swaps in the stored profile after hydration.
  const profile = useStorageValue(STORAGE_KEYS.profile, DEFAULT_PROFILE);
  const hydrated = useHydrated();

  const save = useCallback((next: UserProfile) => {
    writeStorage(STORAGE_KEYS.profile, next);
  }, []);

  const patch = useCallback((partial: Partial<UserProfile>) => {
    const current = readStorage(STORAGE_KEYS.profile, DEFAULT_PROFILE);
    writeStorage(STORAGE_KEYS.profile, { ...current, ...partial });
  }, []);

  return { profile, save, patch, hydrated };
}
