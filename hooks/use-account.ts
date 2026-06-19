"use client";

import { useCallback } from "react";
import { clearStorage, STORAGE_KEYS, writeStorage } from "@/lib/storage";
import { useStorageValue } from "@/hooks/use-storage";
import type { Account } from "@/types";

/**
 * Mock auth: the signed-in account lives in localStorage. `account` is null
 * when signed out. Swap the body for a real provider later — the surface
 * (account/register/logout) stays the same.
 */
export function useAccount() {
  const account = useStorageValue<Account | null>(STORAGE_KEYS.account, null);

  const register = useCallback((name: string, email: string) => {
    const next: Account = {
      name: name.trim(),
      email: email.trim(),
      createdAt: new Date().toISOString(),
    };
    writeStorage(STORAGE_KEYS.account, next);
  }, []);

  const logout = useCallback(() => clearStorage(STORAGE_KEYS.account), []);

  return { account, register, logout };
}
