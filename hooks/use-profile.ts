"use client";

import { useCallback, useEffect, useState } from "react";
import { readStorage, STORAGE_KEYS, writeStorage } from "@/lib/storage";
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
  // Start with default so the server-rendered HTML matches the first client
  // render; we hydrate from localStorage in the effect below.
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProfile(readStorage(STORAGE_KEYS.profile, DEFAULT_PROFILE));
    setHydrated(true);
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ key: string }>).detail;
      if (detail?.key === STORAGE_KEYS.profile) {
        setProfile(readStorage(STORAGE_KEYS.profile, DEFAULT_PROFILE));
      }
    };
    window.addEventListener("aygo:storage", handler);
    return () => window.removeEventListener("aygo:storage", handler);
  }, []);

  const save = useCallback((next: UserProfile) => {
    setProfile(next);
    writeStorage(STORAGE_KEYS.profile, next);
  }, []);

  const patch = useCallback(
    (partial: Partial<UserProfile>) => {
      const next = { ...profile, ...partial };
      setProfile(next);
      writeStorage(STORAGE_KEYS.profile, next);
    },
    [profile],
  );

  return { profile, save, patch, hydrated };
}
