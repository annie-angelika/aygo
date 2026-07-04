"use client";

// Invisible island: hydrates the local-first cache from the backend on load.
// Mounted once in the root layout so every route — app shell or full-bleed
// event page — gets the account's server state. Renders nothing.

import { useServerSync } from "@/hooks/use-server-sync";

export function ServerSync() {
  useServerSync();
  return null;
}
