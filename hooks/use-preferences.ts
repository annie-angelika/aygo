"use client";

import { useStorageValue } from "@/hooks/use-storage";
import { STORAGE_KEYS, writeStorage } from "@/lib/storage";
import { savePreferences } from "@/lib/api";
import type { Category, NotificationChannel, Preferences } from "@/types";

// Stable module-level default (required by useSyncExternalStore).
const DEFAULT_PREFERENCES: Preferences = {
  theme: "system",
  language: "en",
  notifications: {
    invites: ["email", "whatsapp", "push"],
    reminders: ["email", "whatsapp", "push"],
    blasts: ["email", "whatsapp", "push"],
    updates: ["email", "push"],
    feedback: ["email"],
  },
};

/**
 * Locally-saved app preferences (theme, language, notification channels).
 * Auto-persists on every change — Luma-style, no explicit save button.
 * Local-first: persists instantly, then syncs to the backend in the background.
 */
export function usePreferences() {
  const prefs = useStorageValue<Preferences>(
    STORAGE_KEYS.preferences,
    DEFAULT_PREFERENCES,
  );

  const update = (patch: Partial<Preferences>) => {
    const next = { ...prefs, ...patch };
    writeStorage(STORAGE_KEYS.preferences, next);
    void savePreferences(next).catch((e) =>
      console.error("preferences sync failed", e),
    );
  };

  /** Replace the channels a notification type is delivered on. */
  const setChannels = (typeId: string, channels: NotificationChannel[]) =>
    update({ notifications: { ...prefs.notifications, [typeId]: channels } });

  /** Toggle one interest in the "For you" set. */
  const toggleInterest = (c: Category) => {
    const current = prefs.interests ?? [];
    update({
      interests: current.includes(c)
        ? current.filter((i) => i !== c)
        : [...current, c],
    });
  };

  return { prefs, update, setChannels, toggleInterest };
}
