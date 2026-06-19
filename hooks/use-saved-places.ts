"use client";

import { useCallback } from "react";
import { readStorage, STORAGE_KEYS, writeStorage } from "@/lib/storage";
import { useStorageValue, useHydrated } from "@/hooks/use-storage";

const EMPTY: string[] = [];

export function useSavedPlaces() {
  const saved = useStorageValue<string[]>(STORAGE_KEYS.savedPlaces, EMPTY);
  const hydrated = useHydrated();

  const toggle = useCallback((id: string) => {
    const prev = readStorage<string[]>(STORAGE_KEYS.savedPlaces, EMPTY);
    const next = prev.includes(id)
      ? prev.filter((x) => x !== id)
      : [...prev, id];
    writeStorage(STORAGE_KEYS.savedPlaces, next);
  }, []);

  const isSaved = useCallback((id: string) => saved.includes(id), [saved]);

  return { saved, toggle, isSaved, hydrated };
}
