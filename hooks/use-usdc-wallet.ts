"use client";

import { useCallback, useEffect, useState } from "react";
import { usePollar, addressForChain } from "@pollar/react";

import { expectSignature, trustlineFor } from "@/lib/pollar-confirm";
import { savePayoutWallet } from "@/lib/api";
import { USDC, usdcAccount } from "@/lib/stellar";

/** A browser's "Failed to fetch" means Pollar's server didn't answer properly. */
function setupError(details?: string): string {
  if (!details || /failed to fetch|networkerror|load failed/i.test(details))
    return "The wallet service didn't respond, so nothing changed. Try again in a minute.";
  return details;
}

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
      // The button said what this does; skip Pollar's second prompt for it.
      expectSignature(trustlineFor(USDC));
      const outcome = await setTrustline({ code: USDC.code, issuer: USDC.issuer });
      if (outcome.status === "error") {
        setError(setupError(outcome.details));
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
      setError(setupError(e instanceof Error ? e.message : undefined));
    } finally {
      setBusy(false);
    }
  }, [setTrustline, check]);

  return { address, trusted, busy, error, enable, recheck: () => check() };
}

/**
 * The wallet a host is paid into: their Polygon one, where Bolivia's bank QR
 * delivers USDC in a single step and nothing has to be set up first. Null
 * until Pollar has created it (it does at sign-in).
 */
export function usePayoutWallet(): string | null {
  const { wallets } = usePollar();
  return addressForChain(wallets, "POLYGON") || null;
}

const REPORTED = "aygo.payout";

/**
 * Hosts get paid without setting anything up: once signed in, the wallet
 * their login created is reported to the server (once per wallet), and their
 * paid events that had none start taking bank-QR payments into it.
 */
export function usePayoutWalletSync(signedIn: boolean): void {
  const address = usePayoutWallet();
  useEffect(() => {
    if (!signedIn || !address) return;
    try {
      if (localStorage.getItem(REPORTED) === address) return;
    } catch {
      /* private mode — report every load, it's idempotent */
    }
    let cancelled = false;
    void savePayoutWallet(address)
      .then(() => {
        if (cancelled) return;
        try {
          localStorage.setItem(REPORTED, address);
        } catch {
          /* fine */
        }
      })
      .catch(() => {
        /* next load tries again */
      });
    return () => {
      cancelled = true;
    };
  }, [signedIn, address]);
}
