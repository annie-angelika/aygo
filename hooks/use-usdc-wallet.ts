"use client";

import { useCallback, useEffect, useState } from "react";
import { usePollar, addressForChain } from "@pollar/react";

import { USDC, usdcAccount } from "@/lib/stellar";

/**
 * The signed-in person's own Stellar wallet (the one Pollar created at login)
 * and whether it can hold USDC yet. Hosts need it to get paid in the app:
 * `enable` adds the USDC trustline (Pollar asks them to approve it).
 */
export function useUsdcWallet() {
  const { wallets, setTrustline } = usePollar();
  const address = addressForChain(wallets, "STELLAR") || null;
  // undefined → not checked yet; null → the ledger couldn't be read.
  const [trusted, setTrusted] = useState<boolean | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const check = useCallback(
    async (signal?: AbortSignal) => {
      if (!address) return;
      const account = await usdcAccount(address, signal);
      if (!signal?.aborted) setTrusted(account ? account.trusted : null);
    },
    [address],
  );

  useEffect(() => {
    const ctrl = new AbortController();
    // Deferred a tick: the read answers asynchronously, never during the effect.
    const t = setTimeout(() => void check(ctrl.signal), 0);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [check]);

  const enable = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const outcome = await setTrustline({ code: USDC.code, issuer: USDC.issuer });
      if (outcome.status === "error") {
        setError(outcome.details || "Couldn't set up USDC on your wallet. Try again.");
        return;
      }
      if (outcome.status === "cosign_pending") {
        setError("Approve the request on your device, then check again.");
        return;
      }
      // The ledger closes in ~5 s; read it back rather than assume.
      await new Promise((r) => setTimeout(r, 6000));
      await check();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't set up USDC on your wallet.");
    } finally {
      setBusy(false);
    }
  }, [setTrustline, check]);

  return { address, trusted, busy, error, enable, recheck: () => check() };
}
