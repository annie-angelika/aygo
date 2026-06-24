"use client";

import { useStorageValue, useHydrated } from "@/hooks/use-storage";
import { STORAGE_KEYS, writeStorage } from "@/lib/storage";
import { LEVELS } from "@/lib/events-data";
import {
  rsvp,
  cancelRsvp,
  applyToEvent,
  withdrawApplication,
  collectStamp,
} from "@/lib/api";
import type { AygoEvent, Stamp } from "@/types";

// Stable module-level fallbacks (required by useSyncExternalStore).
const NO_GOING: string[] = [];
const NO_APPLIED: string[] = [];
const NO_STAMPS: Stamp[] = [];

// Fire-and-forget backend sync: the local write already updated the UI, so a
// failed sync must never throw into the optimistic path. (A real backend would
// retry from a queue; here we just keep the UI responsive.)
const sync = (op: Promise<void>) =>
  void op.catch((e) => console.error("registration sync failed", e));

/**
 * The whole gamification state, backed by localStorage and reactive across the
 * app: which events you're going to, which you've requested to join (pending the
 * host's approval), and the stamps you've collected.
 */
export function useRegistrations() {
  const going = useStorageValue<string[]>(STORAGE_KEYS.going, NO_GOING);
  const applied = useStorageValue<string[]>(STORAGE_KEYS.applied, NO_APPLIED);
  const stamps = useStorageValue<Stamp[]>(STORAGE_KEYS.stamps, NO_STAMPS);
  const hydrated = useHydrated();

  const isGoing = (id: string) => going.includes(id);
  const toggleGoing = (id: string) => {
    const next = isGoing(id);
    writeStorage(
      STORAGE_KEYS.going,
      next ? going.filter((g) => g !== id) : [...going, id],
    );
    sync(next ? cancelRsvp(id) : rsvp(id));
  };

  const isApplied = (id: string) => applied.includes(id);
  // Submitting a request: drops a pending marker, never touches "going".
  const apply = (id: string, message?: string) => {
    if (isApplied(id)) return;
    writeStorage(STORAGE_KEYS.applied, [...applied, id]);
    sync(applyToEvent(id, message));
  };
  const withdraw = (id: string) => {
    writeStorage(STORAGE_KEYS.applied, applied.filter((a) => a !== id));
    sync(withdrawApplication(id));
  };
  // Instant join (no approval needed): straight into "going".
  const join = (id: string) => {
    if (isGoing(id)) return;
    writeStorage(STORAGE_KEYS.going, [...going, id]);
    sync(rsvp(id));
  };

  const hasStamp = (id: string) => stamps.some((s) => s.eventId === id);
  const addStamp = (event: AygoEvent) => {
    if (hasStamp(event.id)) return;
    const stamp: Stamp = {
      eventId: event.id,
      title: event.title,
      category: event.category,
      image: event.cover,
    };
    writeStorage(STORAGE_KEYS.stamps, [...stamps, stamp]);
    // Once attended, it leaves the "going" and "applied" lists.
    writeStorage(STORAGE_KEYS.going, going.filter((g) => g !== event.id));
    writeStorage(STORAGE_KEYS.applied, applied.filter((a) => a !== event.id));
    sync(collectStamp(event.id));
  };

  return {
    going,
    applied,
    stamps,
    hydrated,
    isGoing,
    toggleGoing,
    isApplied,
    apply,
    withdraw,
    join,
    hasStamp,
    addStamp,
  };
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
