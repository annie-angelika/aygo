"use client";

import { useCallback, useEffect, useState } from "react";
import { readStorage, STORAGE_KEYS, writeStorage } from "@/lib/storage";

const MAX = 8;

export function useRecentSearches() {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    setRecent(readStorage<string[]>(STORAGE_KEYS.recentSearches, []));
  }, []);

  const push = useCallback((query: string) => {
    const q = query.trim();
    if (!q) return;
    setRecent((prev) => {
      // Move-to-front semantics so the freshest query shows first.
      const without = prev.filter((p) => p.toLowerCase() !== q.toLowerCase());
      const next = [q, ...without].slice(0, MAX);
      writeStorage(STORAGE_KEYS.recentSearches, next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setRecent([]);
    writeStorage(STORAGE_KEYS.recentSearches, []);
  }, []);

  return { recent, push, clear };
}
