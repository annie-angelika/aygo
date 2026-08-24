"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Module-level cache for stale-while-revalidate: a keyed fetch paints its last
// value instantly on remount/navigation, then refreshes in the background. This
// is what makes repeat visits feel instant. It's in-memory by design (per tab,
// cleared on reload) so it never competes with the audited localStorage surface.
const cache = new Map<string, unknown>();
// Instances sharing a cacheKey also share invalidation: `refetch` from one
// (e.g. the inbox marking everything read) re-runs every other (the bell).
const listeners = new Map<string, Set<() => void>>();

export type AsyncState<T> = {
  data: T | undefined;
  /** True only on the first load with no cached value to show. */
  loading: boolean;
  error: Error | null;
  /** Re-run the fetcher (e.g. pull-to-refresh). */
  refetch: () => void;
};

type Options = {
  /**
   * Enables the SWR cache + dedupes identical fetches across components. MUST be
   * unique per distinct result: if the fetcher varies by a param, fold it into
   * the key (e.g. `user:${username}`), or different params will share a cache
   * entry and show stale data.
   */
  cacheKey?: string;
  /** Skip fetching until true (e.g. waiting on a route param). */
  enabled?: boolean;
};

/**
 * Generic data-fetching hook for the read side of `@/lib/api`. Handles
 * loading/error state, cancellation, and stale-while-revalidate caching, so a
 * feature hook is a one-liner:
 *
 *   const { data, loading } = useAsyncData(
 *     (signal) => fetchEvents(signal),
 *     [],
 *     { cacheKey: "events" },
 *   );
 *
 * `deps` follows the usual rule: list every value the fetcher closes over.
 */
export function useAsyncData<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: React.DependencyList,
  options: Options = {},
): AsyncState<T> {
  const { cacheKey, enabled = true } = options;

  const cached = cacheKey ? (cache.get(cacheKey) as T | undefined) : undefined;
  const [data, setData] = useState<T | undefined>(cached);
  // Only the first load with nothing to show blocks the UI; refetches revalidate
  // in the background (the stale value stays on screen).
  const [loading, setLoading] = useState(enabled && cached === undefined);
  const [error, setError] = useState<Error | null>(null);
  const [nonce, setNonce] = useState(0);

  // Always call the latest fetcher without making it an effect dependency. The
  // ref is updated in an effect (never during render), and because this effect
  // is declared before the fetch effect it commits first within a render.
  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const refetch = useCallback(() => {
    const peers = cacheKey ? listeners.get(cacheKey) : undefined;
    if (peers && peers.size > 0) peers.forEach((bump) => bump());
    else setNonce((n) => n + 1);
  }, [cacheKey]);

  useEffect(() => {
    if (!cacheKey) return;
    const bump = () => setNonce((n) => n + 1);
    const set = listeners.get(cacheKey) ?? new Set<() => void>();
    set.add(bump);
    listeners.set(cacheKey, set);
    return () => {
      set.delete(bump);
      if (set.size === 0) listeners.delete(cacheKey);
    };
  }, [cacheKey]);

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();

    fetcherRef
      .current(controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        if (cacheKey) cache.set(cacheKey, result);
        setData(result);
        setError(null);
      })
      .catch((e: unknown) => {
        if (controller.signal.aborted) return;
        setError(e instanceof Error ? e : new Error(String(e)));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, cacheKey, nonce, ...deps]);

  return { data, loading, error, refetch };
}
