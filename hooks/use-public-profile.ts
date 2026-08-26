"use client";

// Someone else's public profile (/u/<username>): identity, collection and the
// public events they host. `missing` is a real 404 — nobody holds that handle.

import { useAsyncData } from "@/hooks/use-async-data";
import { fetchPublicProfile, ApiError } from "@/lib/api";
import { normalizeUsername } from "@/lib/username";

export function usePublicProfile(username: string) {
  const handle = normalizeUsername(username);
  const { data, loading, error } = useAsyncData(
    (signal) => fetchPublicProfile(handle, signal),
    [handle],
    { cacheKey: `profile:${handle}` },
  );
  const missing = error instanceof ApiError && error.status === 404;
  return { profile: data ?? null, loading, missing };
}
