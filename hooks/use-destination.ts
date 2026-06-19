"use client";

import { useEffect, useState } from "react";
import { fetchDestination } from "@/lib/api/destinations";
import type { Destination } from "@/types";

type Resolved = { id: string; data: Destination | null; error: Error | null };

export function useDestination(id: string | null | undefined) {
  // Tag the result with the id it belongs to so `loading` can be derived during
  // render — the only setState happens in the async callback, never the body.
  const [resolved, setResolved] = useState<Resolved | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    fetchDestination(id)
      .then((d) => {
        if (!cancelled) setResolved({ id, data: d, error: null });
      })
      .catch((e) => {
        if (!cancelled) {
          setResolved({
            id,
            data: null,
            error: e instanceof Error ? e : new Error(String(e)),
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const isCurrent = id != null && resolved?.id === id;
  const data = isCurrent ? resolved!.data : null;
  const error = isCurrent ? resolved!.error : null;
  const loading = id != null && !isCurrent;
  return { data, loading, error };
}
