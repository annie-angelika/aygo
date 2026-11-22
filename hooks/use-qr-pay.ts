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
import type { RampRoute } from "@pollar/core";

import { ApiError, fetchPayment, reportPayment } from "@/lib/api";
import { refreshRegistrations } from "@/hooks/use-server-sync";
import { useBankQr, type BankQr } from "@/hooks/use-bank-qr";
import { expectSignature, paymentOf } from "@/lib/pollar-confirm";
import { USDC, usdcAccount } from "@/lib/stellar";
import { POLYGON_USDC, isEvmAddress, polygonUsdcBalance, toUsdcUnits } from "@/lib/polygon";
import type { AygoEvent, PaymentReceipt } from "@/types";

/** A balance this close to the price still pays (ramp fees and rate drift). */
const SHORTFALL_OK = 0.97;
const CONFIRM_TRIES = 12;
const CONFIRM_EVERY_MS = 2500;
const FORWARD_EVERY_MS = 4000;
const QUOTE_EVERY_MS = 60_000;
const INTENT_FOR_MS = 24 * 60 * 60_000;

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
  /** Why paying isn't on offer (`phase: "unavailable"`). */
  blocked: "host-wallet" | "no-route" | "no-wallet" | null;
  pay: () => void;
  /** The bank QR for exactly this ticket (scan, pay, done). */
  qr: BankQr;
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

/** "I asked for the bank QR to pay this event" — survives reloads. */
const intentKey = (eventId: string) => `aygo.pay.intent.${eventId}`;
function readIntent(eventId: string): boolean {
  try {
    const at = Number(localStorage.getItem(intentKey(eventId)));
    return at > 0 && Date.now() - at < INTENT_FOR_MS;
  } catch {
    return false;
  }
}
function writeIntent(eventId: string, on: boolean) {
  try {
    if (on) localStorage.setItem(intentKey(eventId), String(Date.now()));
    else localStorage.removeItem(intentKey(eventId));
  } catch {
    /* private mode — the Pay button is still there */
  }
}

export function useQrPay(event: AygoEvent, enabled: boolean): QrPay {
  const { isAuthenticated, wallets, getClient, sendPayment, openKycModal } = usePollar();
  const hostWallet = event.payment?.wallet ?? null;
  // The host's wallet says where the money moves: Polygon ("0x…") is where
  // Bolivia's bank QR lands in one step; Stellar ("G…") is the older route.
  const chain: "POLYGON" | "STELLAR" = isEvmAddress(hostWallet) ? "POLYGON" : "STELLAR";
  const address = addressForChain(wallets, chain) || null;
  const price = event.price ?? 0;

  const [phase, setPhase] = useState<Phase>("loading");
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);
  const [due, setDue] = useState<number | null>(null);
  const [balance, setBalance] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<QrPay["blocked"]>(null);
  const [route, setRoute] = useState<RampRoute | null>(null);
  // What Pollar already told us (see `load`): the route, the price, when asked.
  const known = useRef<{ route: RampRoute | null; due: number | null; quotedAt: number }>({
    route: null,
    due: null,
    quotedAt: 0,
  });
  const memo = useRef<string | null>(null);
  const busy = useRef(false);
  // Set once the bank payment has landed: the USDC goes on to the host without
  // another tap — paying the ticket is the one thing the guest asked for.
  const [forwarding, setForwarding] = useState(() => readIntent(event.id));

  /** Ask the server to verify a sent transaction until the ledger has it. */
  const confirm = useCallback(
    async (hash: string): Promise<boolean> => {
      for (let i = 0; i < CONFIRM_TRIES; i++) {
        try {
          const r = await reportPayment(event.id, hash);
          writePending(event.id, null);
          writeIntent(event.id, false);
          setReceipt(r);
          setPhase("paid");
          // Paid → the reserved spot is now "going" everywhere it shows.
          void refreshRegistrations();
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

  /** The guest's USDC on the chain this event is paid on; null when unreadable. */
  const readBalance = useCallback(
    async (signal?: AbortSignal): Promise<number | null> => {
      if (!address) return null;
      if (chain === "POLYGON") return polygonUsdcBalance(address, signal);
      return (await usdcAccount(address, signal))?.balance ?? null;
    },
    [address, chain],
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
        if (!isAuthenticated) {
          setPhase("signin");
          return;
        }
        // Signed in before this chain was turned on: the wallet appears at the
        // next sign-in.
        if (!address) {
          setBlocked("no-wallet");
          setPhase("unavailable");
          return;
        }
        const client = getClient();
        // Polygon: any address can receive USDC. Stellar: the host's account
        // must exist and trust USDC, or a payment to it would fail.
        // The route and the price are asked for once: Pollar rate-limits
        // both, and this runs again on every return to the page.
        const [host, mine, routes] = await Promise.all([
          chain === "POLYGON" ? null : usdcAccount(hostWallet, signal),
          readBalance(signal),
          known.current.route ? null : client.getRampRoutes("ONRAMP").catch(() => null),
        ]);
        if (signal?.aborted) return;
        if (mine != null) setBalance(mine);
        const route =
          known.current.route ??
          routes?.routes.find(
            (r) =>
              r.fiat.currency === "BOB" &&
              r.asset.chain === chain &&
              r.asset.code === USDC.code,
          ) ??
          null;
        // Couldn't ask (not "there is none"): keep what's on screen.
        if (!route && !routes) {
          setPhase((p) => (p === "loading" ? "unavailable" : p));
          return;
        }
        known.current.route = route;
        // A host wallet that can't receive USDC would only burn the guest's fee.
        if (!route || host?.trusted === false) {
          setBlocked(host?.trusted === false ? "host-wallet" : "no-route");
          setPhase("unavailable");
          return;
        }
        setBlocked(null);
        setRoute(route);
        if (known.current.due == null && Date.now() - known.current.quotedAt > QUOTE_EVERY_MS) {
          known.current.quotedAt = Date.now();
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
          // No quote: the price shows once one comes back (or an order has one).
          if (Number.isFinite(out) && out > 0) {
            known.current.due = out;
            setDue(out);
          }
        }
        setPhase("ready");
      } catch (e) {
        if (signal?.aborted) return;
        setError(e instanceof Error ? e.message : "Couldn't load the payment.");
        setPhase("unavailable");
      }
    },
    [enabled, hostWallet, price, event.id, isAuthenticated, address, chain, getClient, confirm, readBalance],
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

  const qr = useBankQr(event.id, enabled ? route : null, price, (delivered) => {
    // What the order delivered is what the ticket costs in USDC.
    if (delivered) setDue(delivered);
    setForwarding(true);
    void load();
  }, openKycModal);

  // An order knows exactly what it delivers; before one exists, the quote.
  const owed = qr.amountOut ?? due;
  const enough = owed != null && balance >= owed * SHORTFALL_OK;

  const pay = useCallback(async () => {
    if (busy.current || !hostWallet || owed == null || !memo.current || !enough) return;
    busy.current = true;
    // One automatic try per trigger: a send that fails waits for a tap.
    setForwarding(false);
    setError(null);
    setPhase("paying");
    try {
      const sending = Math.min(balance, owed);
      let outcome;
      if (chain === "POLYGON") {
        const units = toUsdcUnits(sending);
        // "Pay now" already shows the amount and who gets it.
        expectSignature(paymentOf(hostWallet, units));
        outcome = await sendPayment({ chain: "POLYGON", destination: hostWallet, amount: units, mint: POLYGON_USDC });
      } else {
        const amount = sending.toFixed(7);
        expectSignature(paymentOf(hostWallet, amount));
        outcome = await sendPayment({
          destination: hostWallet,
          amount,
          asset: { type: "credit_alphanum4", code: USDC.code, issuer: USDC.issuer },
          options: { memo: { type: "text", value: memo.current } },
        });
      }
      if (outcome.status === "success" || outcome.status === "pending") {
        writePending(event.id, outcome.hash);
        setPhase("confirming");
        if (!(await confirm(outcome.hash))) setPhase("ready");
      } else {
        setError(
          outcome.status === "cosign_pending"
            ? "Approve the payment on your device, then tap Refresh."
            : `The payment didn't go through — your money is still in your wallet.${
                // Pollar's own reason, when it gives a readable one.
                outcome.status === "error" && outcome.message && !/^[A-Z0-9_]+$/.test(outcome.message)
                  ? ` (${outcome.message})`
                  : " Try again."
              }`,
        );
        setPhase("ready");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "The payment didn't go through.");
      setPhase("ready");
    } finally {
      busy.current = false;
    }
  }, [hostWallet, owed, enough, balance, chain, sendPayment, event.id, confirm]);

  // The guest asked for the bank QR to pay THIS ticket, so the USDC it buys
  // goes on to the host by itself the moment the wallet shows it — whichever
  // notices first (the order finishing, or the balance), and across a reload
  // or a trip to the bank app. The intent is forgotten once paid, or a day on.
  useEffect(() => {
    if (!forwarding || phase !== "ready") return;
    if (enough) {
      const t = setTimeout(() => void pay(), 0);
      return () => clearTimeout(t);
    }
    // Only the balance is watched — no need to ask Pollar anything again.
    const every = setInterval(() => {
      void readBalance().then((b) => {
        if (b != null) setBalance(b);
      });
    }, FORWARD_EVERY_MS);
    return () => clearInterval(every);
  }, [forwarding, phase, enough, pay, readBalance]);

  const startQr = useCallback(() => {
    writeIntent(event.id, true);
    setForwarding(true);
    qr.start();
  }, [event.id, qr]);

  return {
    phase,
    receipt,
    due: owed,
    balance,
    enough,
    error,
    blocked,
    pay: () => void pay(),
    qr: { ...qr, start: startQr },
    refresh: () => void load(),
  };
}
