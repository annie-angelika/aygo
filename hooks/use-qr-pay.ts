"use client";

// Paying a paid event in the app. The money path is the guest's own wallet:
//   1. Bolivianos → USDC by bank QR. That is Pollar's ramp (Stereum is the
//      Bolivian provider); its own widget shows the QR and walks any
//      verification the provider asks for.
//   2. USDC → the host's wallet, tagged with this guest's memo.
//   3. The server reads the transaction off the ledger and keeps the receipt.
// The hook only offers what can actually work: no route for BOB in this app's
// Pollar setup means there is no price in USDC, and the caller falls back to
// the host's other channels.

import { useCallback, useEffect, useRef, useState } from "react";
import { usePollar, addressForChain } from "@pollar/react";

import { ApiError, fetchPayment, reportPayment } from "@/lib/api";
import { USDC, usdcAccount } from "@/lib/stellar";
import type { AygoEvent, PaymentReceipt } from "@/types";

/** A balance this close to the price still pays (ramp fees and rate drift). */
const SHORTFALL_OK = 0.97;
const CONFIRM_TRIES = 12;
const CONFIRM_EVERY_MS = 2500;

type Phase = "loading" | "signin" | "unavailable" | "ready" | "paying" | "confirming" | "paid";

export type QrPay = {
  phase: Phase;
  receipt: PaymentReceipt | null;
  /** What the ticket costs in USDC right now (the ramp's own quote). */
  due: number | null;
  balance: number;
  /** The guest already holds enough USDC to pay without topping up. */
  enough: boolean;
  error: string | null;
  pay: () => void;
  /** Open Pollar's ramp to buy USDC by bank QR. */
  topUp: () => void;
  refresh: () => void;
};

const pendingKey = (eventId: string) => `aygo.pay.${eventId}`;
function readPending(eventId: string): string | null {
  try {
    return localStorage.getItem(pendingKey(eventId));
  } catch {
    return null;
  }
}
function writePending(eventId: string, hash: string | null) {
  try {
    if (hash) localStorage.setItem(pendingKey(eventId), hash);
    else localStorage.removeItem(pendingKey(eventId));
  } catch {
    /* private mode — the receipt still lands when the request succeeds */
  }
}

export function useQrPay(event: AygoEvent, enabled: boolean): QrPay {
  const { isAuthenticated, wallets, getClient, sendPayment, openRampModal } = usePollar();
  const address = addressForChain(wallets, "STELLAR") || null;
  const hostWallet = event.payment?.wallet ?? null;
  const price = event.price ?? 0;

  const [phase, setPhase] = useState<Phase>("loading");
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);
  const [due, setDue] = useState<number | null>(null);
  const [balance, setBalance] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const memo = useRef<string | null>(null);
  const busy = useRef(false);

  /** Ask the server to verify a sent transaction until the ledger has it. */
  const confirm = useCallback(
    async (hash: string): Promise<boolean> => {
      for (let i = 0; i < CONFIRM_TRIES; i++) {
        try {
          const r = await reportPayment(event.id, hash);
          writePending(event.id, null);
          setReceipt(r);
          setPhase("paid");
          return true;
        } catch (e) {
          const status = e instanceof ApiError ? e.status : 0;
          if (status === 400) {
            // The ledger says this transaction isn't a payment for this spot.
            writePending(event.id, null);
            setError(e instanceof Error ? e.message : "That payment couldn't be confirmed.");
            return false;
          }
          await new Promise((r) => setTimeout(r, CONFIRM_EVERY_MS));
        }
      }
      setError("Your payment was sent but isn't confirmed yet. It's saved — tap Refresh in a minute.");
      return false;
    },
    [event.id],
  );

  const load = useCallback(
    async (signal?: AbortSignal) => {
      if (!enabled || !hostWallet || price <= 0 || busy.current) return;
      try {
        const state = await fetchPayment(event.id, signal);
        if (signal?.aborted) return;
        memo.current = state.memo;
        if (state.receipt) {
          setReceipt(state.receipt);
          setPhase("paid");
          return;
        }
        // A payment sent earlier whose confirmation never came back.
        const pending = readPending(event.id);
        if (pending) {
          setPhase("confirming");
          if (await confirm(pending)) return;
        }
        if (!isAuthenticated || !address) {
          setPhase("signin");
          return;
        }
        const client = getClient();
        const [host, mine, routes] = await Promise.all([
          usdcAccount(hostWallet, signal),
          usdcAccount(address, signal),
          client.getRampRoutes("ONRAMP").catch(() => null),
        ]);
        if (signal?.aborted) return;
        setBalance(mine?.balance ?? 0);
        const route = routes?.routes.find(
          (r) =>
            r.fiat.currency === "BOB" &&
            r.asset.chain === "STELLAR" &&
            r.asset.code === USDC.code,
        );
        // A host wallet that can't receive USDC would only burn the guest's fee.
        if (!route || host?.trusted === false) {
          setPhase("unavailable");
          return;
        }
        const quoted = await client
          .quoteRamp({
            direction: "ONRAMP",
            fiat: { currency: route.fiat.currency, rail: route.fiat.rail, country: route.fiat.country },
            asset: { code: route.asset.code, identifier: route.asset.identifier, chain: route.asset.chain },
            amount: { value: String(price), denomination: "in" },
          })
          .catch(() => null);
        if (signal?.aborted) return;
        const out = Number(quoted?.quotes[0]?.amountOut);
        // No quote usually means the provider wants the guest verified first —
        // the ramp widget walks that; the price shows once a quote comes back.
        setDue(Number.isFinite(out) && out > 0 ? out : null);
        setPhase("ready");
      } catch (e) {
        if (signal?.aborted) return;
        setError(e instanceof Error ? e.message : "Couldn't load the payment.");
        setPhase("unavailable");
      }
    },
    [enabled, hostWallet, price, event.id, isAuthenticated, address, getClient, confirm],
  );

  useEffect(() => {
    const ctrl = new AbortController();
    // Deferred a tick: everything it learns arrives asynchronously.
    const t = setTimeout(() => void load(ctrl.signal), 0);
    // Coming back from the bank app or the ramp: the balance has likely moved.
    const onVisible = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearTimeout(t);
      ctrl.abort();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load]);

  const enough = due != null && balance >= due * SHORTFALL_OK;

  const pay = useCallback(async () => {
    if (busy.current || !hostWallet || due == null || !memo.current || !enough) return;
    busy.current = true;
    setError(null);
    setPhase("paying");
    try {
      const outcome = await sendPayment({
        destination: hostWallet,
        amount: Math.min(balance, due).toFixed(7),
        asset: { type: "credit_alphanum4", code: USDC.code, issuer: USDC.issuer },
        options: { memo: { type: "text", value: memo.current } },
      });
      if (outcome.status === "success" || outcome.status === "pending") {
        writePending(event.id, outcome.hash);
        setPhase("confirming");
        if (!(await confirm(outcome.hash))) setPhase("ready");
      } else {
        setError(
          outcome.status === "cosign_pending"
            ? "Approve the payment on your device, then tap Refresh."
            : "The payment didn't go through. Nothing was charged — try again.",
        );
        setPhase("ready");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "The payment didn't go through.");
      setPhase("ready");
    } finally {
      busy.current = false;
    }
  }, [hostWallet, due, enough, balance, sendPayment, event.id, confirm]);

  return {
    phase,
    receipt,
    due,
    balance,
    enough,
    error,
    pay: () => void pay(),
    topUp: openRampModal,
    refresh: () => void load(),
  };
}
