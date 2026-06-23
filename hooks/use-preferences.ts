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

  /** Toggle a single channel on a notification type on/off. */
  const toggleChannel = (typeId: string, channel: NotificationChannel) => {
    const current = prefs.notifications[typeId] ?? [];
    const next = current.includes(channel)
      ? current.filter((c) => c !== channel)
      : [...current, channel];
    update({ notifications: { ...prefs.notifications, [typeId]: next } });
  };

  return { prefs, update, toggleChannel };
}
