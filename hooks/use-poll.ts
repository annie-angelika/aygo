"use client";

import { useEffect } from "react";

/** How often live surfaces (bell, inboxes) poll while the tab is open. */
export const POLL_MS = 45_000;

/** Re-run `refetch` every `ms` while the tab is visible (and `enabled`). */
export function usePollWhileVisible(
  refetch: () => void,
  ms: number = POLL_MS,
  enabled = true,
): void {
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => {
      if (document.visibilityState === "visible") refetch();
    }, ms);
    return () => clearInterval(id);
  }, [refetch, ms, enabled]);
}
