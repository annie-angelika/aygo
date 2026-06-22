"use client";

import { useStorageValue } from "@/hooks/use-storage";
import { STORAGE_KEYS, writeStorage } from "@/lib/storage";
import type { ProfileEdits } from "@/types";

// Stable module-level fallback (required by useSyncExternalStore).
const NO_EDITS: Partial<ProfileEdits> = {};

/**
 * Your locally-saved profile edits (name / bio / location). Merge these over the
 * base identity to render the live profile, and call `save` from "Edit profile".
 */
export function useProfileEdits() {
  const edits = useStorageValue<Partial<ProfileEdits>>(
    STORAGE_KEYS.profile,
    NO_EDITS,
  );
  const save = (next: ProfileEdits) =>
    writeStorage(STORAGE_KEYS.profile, next);
  return { edits, save };
}
