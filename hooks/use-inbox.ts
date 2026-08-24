"use client";

// The guest side of messaging: your questions to hosts and your reports, each a
// thread with the replies so far.

import { useAsyncData } from "@/hooks/use-async-data";
import { useAuth } from "@/hooks/use-auth";
import { fetchMyThreads, type EventReport } from "@/lib/api";

const NONE: EventReport[] = [];

export function useMyThreads() {
  const { isAuthenticated } = useAuth();
  const { data, loading, refetch } = useAsyncData(
    (signal) => fetchMyThreads(signal),
    [],
    { cacheKey: "my-threads", enabled: isAuthenticated },
  );
  return { threads: data ?? NONE, loading, refetch };
}
