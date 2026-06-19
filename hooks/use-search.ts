"use client";

import { useEffect, useState } from "react";
import { searchAll, type SearchResults } from "@/lib/api/search";

const EMPTY: SearchResults = { destinations: [], events: [], guides: [] };

/**
 * Debounced search hook. Re-runs the query 150ms after the input stops
 * changing so we don't hammer the (future) backend on every keystroke.
 */
export function useSearch(query: string, delayMs = 150) {
  const trimmed = query.trim();
  // Track which query produced `results` so we can derive `loading` during
  // render — no setState inside the effect body (only in the async callback).
  const [state, setState] = useState<{ query: string; results: SearchResults }>(
    { query: "", results: EMPTY },
  );

  useEffect(() => {
    if (!trimmed) return;
    let cancelled = false;
    const handle = setTimeout(() => {
      searchAll(trimmed).then((res) => {
        if (!cancelled) setState({ query: trimmed, results: res });
      });
    }, delayMs);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [trimmed, delayMs]);

  // Keep the last results visible while a new query resolves (stale-while-
  // revalidate); loading is true whenever the current query hasn't landed yet.
  const data = trimmed ? state.results : EMPTY;
  const loading = trimmed.length > 0 && state.query !== trimmed;
  const hasResults =
    data.destinations.length + data.events.length + data.guides.length > 0;

  return { data, loading, hasResults };
}
