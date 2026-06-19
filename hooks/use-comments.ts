"use client";

import { useCallback } from "react";
import { readStorage, STORAGE_KEYS, writeStorage } from "@/lib/storage";
import { useStorageValue } from "@/hooks/use-storage";
import type { PlaceComment } from "@/types";

const EMPTY: PlaceComment[] = [];

function newId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `c_${Date.now()}_${Math.round(Math.random() * 1e6)}`;
}

/**
 * Community comments for a single place, backed by localStorage. All comments
 * share one key; we derive the per-place slice during render.
 */
export function useComments(placeId: string) {
  const all = useStorageValue<PlaceComment[]>(STORAGE_KEYS.comments, EMPTY);
  const comments = all.filter((c) => c.placeId === placeId);

  const add = useCallback(
    (author: string, text: string) => {
      const t = text.trim();
      if (!t) return;
      const prev = readStorage<PlaceComment[]>(STORAGE_KEYS.comments, EMPTY);
      const comment: PlaceComment = {
        id: newId(),
        placeId,
        author,
        text: t,
        createdAt: new Date().toISOString(),
      };
      writeStorage(STORAGE_KEYS.comments, [comment, ...prev]);
    },
    [placeId],
  );

  return { comments, add };
}
