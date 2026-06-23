"use client";

import { useStorageValue } from "@/hooks/use-storage";
import { STORAGE_KEYS, writeStorage } from "@/lib/storage";
import type { NotificationChannel, Preferences } from "@/types";

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
 */
export function usePreferences() {
  const prefs = useStorageValue<Preferences>(
    STORAGE_KEYS.preferences,
    DEFAULT_PREFERENCES,
  );

  const update = (patch: Partial<Preferences>) =>
    writeStorage(STORAGE_KEYS.preferences, { ...prefs, ...patch });

  /** Replace the channels a notification type is delivered on. */
  const setChannels = (typeId: string, channels: NotificationChannel[]) =>
    update({ notifications: { ...prefs.notifications, [typeId]: channels } });

  return { prefs, update, setChannels };
}
