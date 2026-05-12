"use client";

import { useCallback, useEffect, useState } from "react";
import { readStorage, STORAGE_KEYS, writeStorage } from "@/lib/storage";

export function useSavedPlaces() {
  const [saved, setSaved] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSaved(readStorage<string[]>(STORAGE_KEYS.savedPlaces, []));
    setHydrated(true);
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ key: string }>).detail;
      if (detail?.key === STORAGE_KEYS.savedPlaces) {
        setSaved(readStorage<string[]>(STORAGE_KEYS.savedPlaces, []));
      }
    };
    window.addEventListener("aygo:storage", handler);
    return () => window.removeEventListener("aygo:storage", handler);
  }, []);

  const toggle = useCallback((id: string) => {
    setSaved((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      writeStorage(STORAGE_KEYS.savedPlaces, next);
      return next;
    });
  }, []);

  const isSaved = useCallback((id: string) => saved.includes(id), [saved]);

  return { saved, toggle, isSaved, hydrated };
}
