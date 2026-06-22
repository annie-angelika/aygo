"use client";

import { useStorageValue } from "@/hooks/use-storage";
import { STORAGE_KEYS, writeStorage } from "@/lib/storage";

export const MAX_FEATURED = 6;

// Stable module-level fallback (required by useSyncExternalStore).
const NO_FEATURED: string[] = [];

/** The stamp eventIds you've pinned to the top of your passport (max 6). */
export function useFeatured() {
  const featured = useStorageValue<string[]>(
    STORAGE_KEYS.featured,
    NO_FEATURED,
  );

  const toggle = (id: string) => {
    if (featured.includes(id)) {
      writeStorage(STORAGE_KEYS.featured, featured.filter((f) => f !== id));
    } else if (featured.length < MAX_FEATURED) {
      writeStorage(STORAGE_KEYS.featured, [...featured, id]);
    }
  };

  return { featured, toggle };
}
