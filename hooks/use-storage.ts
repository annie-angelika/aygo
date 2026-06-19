"use client";

import { useCallback, useSyncExternalStore } from "react";
import { readStorage, type StorageKey } from "@/lib/storage";

// Per-key snapshot cache so getSnapshot returns a referentially-stable value
// while the underlying raw string is unchanged — required by
// useSyncExternalStore to avoid an infinite render loop.
const snapshots = new Map<StorageKey, { raw: string | null; value: unknown }>();

function subscribe(callback: () => void) {
  // In-tab writes broadcast "aygo:storage"; other tabs fire native "storage".
  window.addEventListener("aygo:storage", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("aygo:storage", callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot<T>(key: StorageKey, fallback: T): T {
  const raw =
    typeof window === "undefined" ? null : window.localStorage.getItem(key);
  const cached = snapshots.get(key);
  if (cached && cached.raw === raw) return cached.value as T;
  const value = readStorage(key, fallback);
  snapshots.set(key, { raw, value });
  return value as T;
}

/**
 * Read a localStorage-backed value reactively. SSR-safe via
 * useSyncExternalStore's server snapshot (returns `fallback`), and updates
 * across hooks/tabs through the `aygo:storage` + native `storage` events.
 * Writes go through `writeStorage` in `@/lib/storage`, which fires the event.
 *
 * `fallback` MUST be referentially stable (a module-level constant) so the
 * server snapshot stays consistent across renders.
 */
export function useStorageValue<T>(key: StorageKey, fallback: T): T {
  const getClientSnapshot = useCallback(
    () => getSnapshot(key, fallback),
    [key, fallback],
  );
  const getServerSnapshot = useCallback(() => fallback, [fallback]);
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}

const noopSubscribe = () => () => {};

/**
 * `false` during SSR and the first client paint, `true` once mounted — without
 * a setState-in-effect. Lets consumers defer storage-backed UI until the real
 * value is available (avoids a hydration flash).
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
