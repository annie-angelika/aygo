"use client";

import { useStorageValue } from "@/hooks/use-storage";
import { STORAGE_KEYS, writeStorage } from "@/lib/storage";
import { savePreferences } from "@/lib/api";
import { pushLocalEdit } from "@/lib/unsynced";
import type { Category, Preferences } from "@/types";

// Stable module-level default (required by useSyncExternalStore).
const DEFAULT_PREFERENCES: Preferences = {};

/**
 * Saved app preferences — interests and home city, the two things the app
 * actually reads. Auto-persists on every change (Luma-style, no save button):
 * locally first, then synced to the backend in the background.
 */
export function usePreferences() {
  const prefs = useStorageValue<Preferences>(
    STORAGE_KEYS.preferences,
    DEFAULT_PREFERENCES,
  );

  const update = (patch: Partial<Preferences>) => {
    const next = { ...prefs, ...patch };
    writeStorage(STORAGE_KEYS.preferences, next);
    void pushLocalEdit("preferences", () => savePreferences(next)).catch((e) =>
      console.error("preferences sync failed", e),
    );
  };

  /** Toggle one interest. */
  const toggleInterest = (c: Category) => {
    const current = prefs.interests ?? [];
    update({
      interests: current.includes(c)
        ? current.filter((i) => i !== c)
        : [...current, c],
    });
  };

  return { prefs, update, toggleInterest };
}
