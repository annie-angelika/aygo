"use client";

import { useSyncExternalStore } from "react";

// A one-flag store for the sign-in modal, so any component (top bar, RSVP
// button, a gate) can open the same modal without threading props around.

let open = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function openLogin(): void {
  if (open) return;
  open = true;
  emit();
}

export function closeLogin(): void {
  if (!open) return;
  open = false;
  emit();
}

export function useLoginOpen(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => open,
    () => false,
  );
}
