"use client";

// The events THIS browser's session created (the ids live in the local created
// drafts), projected through the live catalog so rows show real attendance.
// Soonest first, past events at the end.

import { useEvents } from "@/hooks/use-events";
import { useStorageValue } from "@/hooks/use-storage";
import { STORAGE_KEYS } from "@/lib/storage";
import type { EventDraft } from "@/lib/create-event";
import type { AygoEvent } from "@/types";

const NO_DRAFTS: EventDraft[] = [];

export function useHostedEvents(): { hosted: AygoEvent[]; loading: boolean } {
  const { data: events, loading } = useEvents();
  const drafts = useStorageValue<EventDraft[]>(STORAGE_KEYS.created, NO_DRAFTS);
  const ids = new Set(drafts.map((d) => d.id));
  const hosted = events
    .filter((e) => ids.has(e.id))
    .sort((a, b) =>
      a.isPast === b.isPast
        ? a.startsAt.localeCompare(b.startsAt)
        : a.isPast
          ? 1
          : -1,
    );
  return { hosted, loading };
}
