"use client";

import { useCallback, useEffect, useState } from "react";
import { readStorage, STORAGE_KEYS, writeStorage } from "@/lib/storage";
import type { Trip } from "@/types";

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setTrips(readStorage<Trip[]>(STORAGE_KEYS.trips, []));
    setHydrated(true);
  }, []);

  const upsert = useCallback((trip: Trip) => {
    setTrips((prev) => {
      const existing = prev.findIndex((t) => t.id === trip.id);
      const next =
        existing >= 0
          ? prev.map((t, i) => (i === existing ? trip : t))
          : [trip, ...prev];
      writeStorage(STORAGE_KEYS.trips, next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setTrips((prev) => {
      const next = prev.filter((t) => t.id !== id);
      writeStorage(STORAGE_KEYS.trips, next);
      return next;
    });
  }, []);

  return { trips, upsert, remove, hydrated };
}
