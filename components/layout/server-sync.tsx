"use client";

// Invisible island: hydrates the local-first cache from the backend on load.
// Mounted once in the root layout so every route — app shell or full-bleed
// event page — gets the account's server state. Renders nothing.

import { useServerSync } from "@/hooks/use-server-sync";
import { useAuth } from "@/hooks/use-auth";
import { usePayoutWalletSync } from "@/hooks/use-usdc-wallet";

export function ServerSync() {
  useServerSync();
  // Hosts: your paid events take bank-QR payments into your own wallet.
  usePayoutWalletSync(useAuth().isAuthenticated);
  return null;
}
