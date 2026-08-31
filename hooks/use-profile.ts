"use client";

import { useMemo } from "react";

import { useStorageValue } from "@/hooks/use-storage";
import { STORAGE_KEYS, writeStorage } from "@/lib/storage";
import { saveProfile } from "@/lib/api";
import { realAvatar } from "@/lib/utils";
import type { ProfileEdits } from "@/types";

// Stable module-level fallback (required by useSyncExternalStore).
const NO_EDITS: Partial<ProfileEdits> = {};

/**
 * Your locally-saved profile edits (name / bio / location). Merge these over the
 * base identity to render the live profile, and call `save` from "Edit profile".
 * Local-first: persists instantly, then syncs to the backend in the background.
 */
export function useProfileEdits() {
  const stored = useStorageValue<Partial<ProfileEdits>>(
    STORAGE_KEYS.profile,
    NO_EDITS,
  );
  // Older builds prefilled the form with a Picsum placeholder and saving baked
  // it into the edits, shadowing the real (Pollar/uploaded) photo forever.
  // Treat any stock-photo URL as "no avatar chosen" — DROP the key entirely
  // (an `avatar: undefined` left behind would still clobber the Pollar photo
  // in `{ ...auth, ...edits }` spreads). Memoized so consumers' identity
  // checks (e.g. profile-form's reset-during-render) stay stable.
  const edits = useMemo<Partial<ProfileEdits>>(() => {
    if (stored.avatar && !realAvatar(stored.avatar)) {
      const rest = { ...stored };
      delete rest.avatar;
      return rest;
    }
    return stored;
  }, [stored]);
  // Local-first for instant UI, but the caller awaits the server sync — a
  // rejected save (image too big, handle refused, moderation) must surface
  // instead of living only in localStorage until the next sign-out wipes it.
  const save = (next: ProfileEdits): Promise<void> => {
    writeStorage(STORAGE_KEYS.profile, next);
    return saveProfile(next);
  };
  return { edits, save };
}
