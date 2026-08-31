"use client";

// The guest side of messaging: your questions to hosts and your reports, each a
// thread with the replies so far.

import { useAsyncData } from "@/hooks/use-async-data";
import { useAuth } from "@/hooks/use-auth";
import { usePollWhileVisible } from "@/hooks/use-poll";
import { fetchMyThreads, type EventReport } from "@/lib/api";

const NONE: EventReport[] = [];

export function useMyThreads() {
  const { isAuthenticated } = useAuth();
  const { data, loading, refetch } = useAsyncData(
    (signal) => fetchMyThreads(signal),
    [],
    { cacheKey: "my-threads", enabled: isAuthenticated },
  );
  // A host's reply lands in an open inbox without a reload.
  usePollWhileVisible(refetch, undefined, isAuthenticated);
  return { threads: data ?? NONE, loading, refetch };
}
