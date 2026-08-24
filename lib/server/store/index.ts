// Picks the store implementation from AYGO_DATA_SOURCE and hands route handlers a
// single shared instance. The instance is cached on `globalThis` so the memory
// store keeps its state across dev hot-reloads (and the Neon client isn't
// rebuilt on every request).
//
// Schema: the Postgres store's `init()` (CREATE TABLE IF NOT EXISTS …) runs once
// per process before the first query, so a deploy that adds a table never
// depends on someone remembering to hit /api/admin/seed. It's done with a Proxy
// that awaits readiness in front of every public method — the store's own code
// stays plain.

import "server-only";
import { DATA_SOURCE } from "@/lib/server/env";
import { MemoryStore } from "@/lib/server/store/memory";
import { PostgresStore } from "@/lib/server/store/postgres";
import type { Store } from "@/lib/server/store/types";

const globalForStore = globalThis as unknown as { __aygoStore?: Store };

function withReadiness(store: Store): Store {
  let ready: Promise<void> | null = null;
  const ensure = () => {
    if (!ready) {
      ready = store.init().catch((e) => {
        ready = null; // let the next call retry a transient failure
        throw e;
      });
    }
    return ready;
  };
  return new Proxy(store, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value !== "function" || prop === "init") return value;
      return async (...args: unknown[]) => {
        await ensure();
        return (value as (...a: unknown[]) => unknown).apply(target, args);
      };
    },
  });
}

export function getStore(): Store {
  if (!globalForStore.__aygoStore) {
    globalForStore.__aygoStore =
      DATA_SOURCE === "postgres"
        ? withReadiness(new PostgresStore())
        : new MemoryStore();
  }
  return globalForStore.__aygoStore;
}

export type { Store } from "@/lib/server/store/types";
