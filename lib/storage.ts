/**
 * Thin localStorage wrapper. All app-wide keys live here so the storage
 * surface is auditable and SSR-safe (every read/write is gated on `window`).
 */

export const STORAGE_KEYS = {
  going: "aygo.going", // string[] of event ids the user is attending
  applied: "aygo.applied", // string[] of event ids with a request pending host approval
  stamps: "aygo.stamps", // Stamp[] collected in the passport
  profile: "aygo.profile", // ProfileEdits — your editable identity fields
  featured: "aygo.featured", // string[] of stamp eventIds pinned to your passport
  preferences: "aygo.preferences", // Preferences — theme, language, notifications
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export function readStorage<T>(key: StorageKey, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: StorageKey, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    // Broadcast so other hooks in the same tab can react without a full reload.
    window.dispatchEvent(new CustomEvent("aygo:storage", { detail: { key } }));
  } catch {
    /* quota exceeded or storage disabled — fail silently */
  }
}

export function clearStorage(key: StorageKey): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
    window.dispatchEvent(new CustomEvent("aygo:storage", { detail: { key } }));
  } catch {
    /* noop */
  }
}
