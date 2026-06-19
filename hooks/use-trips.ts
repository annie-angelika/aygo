"use client";

import { useCallback } from "react";
import { readStorage, STORAGE_KEYS, writeStorage } from "@/lib/storage";
import { useStorageValue, useHydrated } from "@/hooks/use-storage";
import type { Trip } from "@/types";

const EMPTY: Trip[] = [];

export function useTrips() {
  const trips = useStorageValue<Trip[]>(STORAGE_KEYS.trips, EMPTY);
  const hydrated = useHydrated();

  const upsert = useCallback((trip: Trip) => {
    const prev = readStorage<Trip[]>(STORAGE_KEYS.trips, EMPTY);
    const existing = prev.findIndex((t) => t.id === trip.id);
    const next =
      existing >= 0
        ? prev.map((t, i) => (i === existing ? trip : t))
        : [trip, ...prev];
    writeStorage(STORAGE_KEYS.trips, next);
  }, []);

  const remove = useCallback((id: string) => {
    const prev = readStorage<Trip[]>(STORAGE_KEYS.trips, EMPTY);
    writeStorage(
      STORAGE_KEYS.trips,
      prev.filter((t) => t.id !== id),
    );
  }, []);

  return { trips, upsert, remove, hydrated };
}
