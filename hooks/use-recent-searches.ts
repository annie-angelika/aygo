"use client";

import { useCallback } from "react";
import { readStorage, STORAGE_KEYS, writeStorage } from "@/lib/storage";
import { useStorageValue } from "@/hooks/use-storage";

const MAX = 8;
const EMPTY: string[] = [];

export function useRecentSearches() {
  const recent = useStorageValue<string[]>(STORAGE_KEYS.recentSearches, EMPTY);

  const push = useCallback((query: string) => {
    const q = query.trim();
    if (!q) return;
    const prev = readStorage<string[]>(STORAGE_KEYS.recentSearches, EMPTY);
    // Move-to-front semantics so the freshest query shows first.
    const without = prev.filter((p) => p.toLowerCase() !== q.toLowerCase());
    const next = [q, ...without].slice(0, MAX);
    writeStorage(STORAGE_KEYS.recentSearches, next);
  }, []);

  const clear = useCallback(() => {
    writeStorage(STORAGE_KEYS.recentSearches, EMPTY);
  }, []);

  return { recent, push, clear };
}
