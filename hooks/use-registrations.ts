"use client";

import { useStorageValue, useHydrated } from "@/hooks/use-storage";
import { STORAGE_KEYS, readStorage, writeStorage, type StorageKey } from "@/lib/storage";
import { LEVELS } from "@/lib/events-data";
import {
  rsvp,
  cancelRsvp,
  applyToEvent,
  withdrawApplication,
} from "@/lib/api";
import type { AygoEvent, Stamp } from "@/types";

// Stable module-level fallbacks (required by useSyncExternalStore).
const NO_GOING: string[] = [];
const NO_APPLIED: string[] = [];
const NO_STAMPS: Stamp[] = [];

/**
 * Optimistic write: the local list updates instantly, the server is told, and
 * a refusal rolls the local list back (so the UI never claims a state the
 * server rejected). Errors are also logged for the console.
 */
function syncList<T>(
  key: StorageKey,
  fallback: T[],
  next: T[],
  op: Promise<void>,
): void {
  const before = readStorage<T[]>(key, fallback);
  writeStorage(key, next);
  void op.catch((e) => {
    console.error("registration sync failed", e);
    writeStorage(key, before);
  });
}

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
    syncList(
      STORAGE_KEYS.going,
      NO_GOING,
      next ? going.filter((g) => g !== id) : [...going, id],
      next ? cancelRsvp(id) : rsvp(id),
    );
  };

  const isApplied = (id: string) => applied.includes(id);
  // Submitting a request: the server must accept it (the host is notified
  // from there), so this one AWAITS the write — the marker is optimistic and
  // rolled back if the request is refused, and the error surfaces to the caller.
  const apply = async (id: string, message?: string) => {
    if (isApplied(id)) return;
    writeStorage(STORAGE_KEYS.applied, [...applied, id]);
    try {
      await applyToEvent(id, message);
    } catch (e) {
      writeStorage(
        STORAGE_KEYS.applied,
        readStorage<string[]>(STORAGE_KEYS.applied, NO_APPLIED).filter((a) => a !== id),
      );
      throw e;
    }
  };
  const withdraw = (id: string) => {
    syncList(
      STORAGE_KEYS.applied,
      NO_APPLIED,
      applied.filter((a) => a !== id),
      withdrawApplication(id),
    );
  };
  // Instant join (no approval needed): straight into "going" — awaited and
  // rolled back on refusal (sold out, event over) just like `apply`.
  const join = async (id: string) => {
    if (isGoing(id)) return;
    writeStorage(STORAGE_KEYS.going, [...going, id]);
    try {
      await rsvp(id);
    } catch (e) {
      writeStorage(
        STORAGE_KEYS.going,
        readStorage<string[]>(STORAGE_KEYS.going, NO_GOING).filter((g) => g !== id),
      );
      throw e;
    }
  };

  const hasStamp = (id: string) => stamps.some((s) => s.eventId === id);
  /**
   * Record an aygo the SERVER already granted (the caller awaited the
   * `POST /me/stamps`, so this is a mirror, not a request). Once attended, the
   * event leaves the "going" and "applied" lists.
   */
  const addStamp = (event: AygoEvent) => {
    if (hasStamp(event.id)) return;
    const stamp: Stamp = {
      eventId: event.id,
      title: event.title,
      category: event.category,
      image: event.cover,
      city: event.city,
      earnedAt: new Date().toISOString(),
    };
    writeStorage(STORAGE_KEYS.stamps, [...stamps, stamp]);
    writeStorage(STORAGE_KEYS.going, going.filter((g) => g !== event.id));
    writeStorage(STORAGE_KEYS.applied, applied.filter((a) => a !== event.id));
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
