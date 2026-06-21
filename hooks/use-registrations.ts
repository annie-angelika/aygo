"use client";

import { useStorageValue, useHydrated } from "@/hooks/use-storage";
import { STORAGE_KEYS, writeStorage } from "@/lib/storage";
import { LEVELS } from "@/lib/events-data";
import type { AygoEvent, Stamp } from "@/types";

// Stable module-level fallbacks (required by useSyncExternalStore).
const NO_GOING: string[] = [];
const NO_STAMPS: Stamp[] = [];

/**
 * The whole gamification state, backed by localStorage and reactive across the
 * app: which events you're going to, and the stamps you've collected.
 */
export function useRegistrations() {
  const going = useStorageValue<string[]>(STORAGE_KEYS.going, NO_GOING);
  const stamps = useStorageValue<Stamp[]>(STORAGE_KEYS.stamps, NO_STAMPS);
  const hydrated = useHydrated();

  const isGoing = (id: string) => going.includes(id);
  const toggleGoing = (id: string) =>
    writeStorage(
      STORAGE_KEYS.going,
      isGoing(id) ? going.filter((g) => g !== id) : [...going, id],
    );

  const hasStamp = (id: string) => stamps.some((s) => s.eventId === id);
  const addStamp = (event: AygoEvent) => {
    if (hasStamp(event.id)) return;
    const stamp: Stamp = {
      eventId: event.id,
      title: event.title,
      category: event.category,
    };
    writeStorage(STORAGE_KEYS.stamps, [...stamps, stamp]);
    // Once attended, it leaves the "going" list.
    writeStorage(STORAGE_KEYS.going, going.filter((g) => g !== event.id));
  };

  return { going, stamps, hydrated, isGoing, toggleGoing, hasStamp, addStamp };
}

/** Current level, next level, and progress (0–1) toward it, for a stamp count. */
export function levelFor(count: number) {
  let current = LEVELS[0];
  for (const lvl of LEVELS) if (count >= lvl.min) current = lvl;
  const next = LEVELS.find((l) => l.min > current.min) ?? null;
  const progress = next
    ? (count - current.min) / (next.min - current.min)
    : 1;
  return { current, next, progress: Math.min(1, Math.max(0, progress)) };
}
