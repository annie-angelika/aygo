"use client";

import { useEffect, useState } from "react";
import { searchAll, type SearchResults } from "@/lib/api/search";

const EMPTY: SearchResults = { destinations: [], events: [], guides: [] };

/**
 * Debounced search hook. Re-runs the query 150ms after the input stops
 * changing so we don't hammer the (future) backend on every keystroke.
 */
export function useSearch(query: string, delayMs = 150) {
  const [data, setData] = useState<SearchResults>(EMPTY);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setData(EMPTY);
      setLoading(false);
      return;
    }
    setLoading(true);
    let cancelled = false;
    const handle = setTimeout(() => {
      searchAll(query)
        .then((res) => {
          if (!cancelled) setData(res);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, delayMs);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query, delayMs]);

  const hasResults =
    data.destinations.length + data.events.length + data.guides.length > 0;

  return { data, loading, hasResults };
}
