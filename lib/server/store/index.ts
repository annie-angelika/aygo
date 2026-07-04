// Picks the store implementation from AYGO_DATA_SOURCE and hands route handlers a
// single shared instance. The instance is cached on `globalThis` so the memory
// store keeps its state across dev hot-reloads (and the Neon client isn't
// rebuilt on every request).

import "server-only";
import { DATA_SOURCE } from "@/lib/server/env";
import { MemoryStore } from "@/lib/server/store/memory";
import { PostgresStore } from "@/lib/server/store/postgres";
import type { Store } from "@/lib/server/store/types";

const globalForStore = globalThis as unknown as { __aygoStore?: Store };

export function getStore(): Store {
  if (!globalForStore.__aygoStore) {
    globalForStore.__aygoStore =
      DATA_SOURCE === "postgres" ? new PostgresStore() : new MemoryStore();
  }
  return globalForStore.__aygoStore;
}

export type { Store } from "@/lib/server/store/types";
