"use client";

// Invisible island: binds the server session to the signed-in Pollar account
// (see hooks/use-account-session). Mounted once in the root layout.

import { useAccountSession } from "@/hooks/use-account-session";

export function AccountSession() {
  useAccountSession();
  return null;
}
