"use client";

// Data + ownership check for the host's manage screen. A 403 means "not your
// event" — surfaced as `forbidden` so the screen can explain instead of erroring.

import { useAsyncData } from "@/hooks/use-async-data";
import { fetchManageEvent } from "@/lib/api/manage";
import { ApiError } from "@/lib/api";
import { readStorage, STORAGE_KEYS } from "@/lib/storage";
import type { EventDraft } from "@/lib/create-event";

export function useManageEvent(eventId: string) {
  const { data, loading, error, refetch } = useAsyncData(
    (signal) => fetchManageEvent(eventId, signal),
    [eventId],
    { cacheKey: `manage:${eventId}` },
  );
  const forbidden = error instanceof ApiError && error.status === 403;
  return { data: data ?? null, loading, error, forbidden, refetch };
}

/** Instant client-side hint: did THIS browser create the event? (The server
 * still enforces real ownership on every manage call.) */
export function ownsEventLocally(eventId: string): boolean {
  return readStorage<EventDraft[]>(STORAGE_KEYS.created, []).some(
    (d) => d.id === eventId,
  );
}
