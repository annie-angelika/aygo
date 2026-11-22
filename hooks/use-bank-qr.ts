"use client";

// One bank QR for one amount, without Pollar's "Buy crypto" form: the event
// already says what is owed (Bs → USDC on Stellar), so the guest should only
// have to scan and pay. This drives Pollar's ramp directly — quote the route,
// turn the best quote into an order, show its QR, and follow the order until
// the USDC is in the guest's wallet.
//
// Only the plain path is handled here. Anything that needs the guest to do
// more than pay (identity check, extra details, a signature, a wallet to set
// up) ends in `needsWidget`: Pollar's own window knows how to walk those, and
// it picks the open order up where this left it.

import { useCallback, useEffect, useRef, useState } from "react";
import { usePollar } from "@pollar/react";
import { isPollarApiError, rampQuoteFields, type RampOrder, type RampRoute } from "@pollar/core";

export type BankQrStep =
  | "idle"
  | "starting" // quoting + creating the order
  | "scan" // the QR is on screen, waiting for the bank payment
  | "converting" // paid; Pollar is turning it into USDC on Stellar
  | "funded" // the USDC arrived
  | "failed";

export type BankQrCode = {
  /** `<img src>`-ready picture of the code, when Pollar rendered one. */
  image: string | null;
  /** The raw code, to render (or copy) when there is no picture. */
  payload: string | null;
  /** A page to pay on instead of a code, when the provider works that way. */
  link: string | null;
  amount: string;
  currency: string;
  expiresAt: string | null;
};

export type BankQr = {
  step: BankQrStep;
  code: BankQrCode | null;
  /** USDC this order delivers to the guest's wallet. */
  amountOut: number | null;
  /** Seconds the conversion usually takes, when Pollar says. */
  etaSeconds: number | null;
  error: string | null;
  /** This payment needs a step only Pollar's own window can walk. */
  needsWidget: boolean;
  start: () => void;
  /** "I've paid" — ask the provider now instead of waiting for the next poll. */
  check: () => void;
  reset: () => void;
};

const FINAL = new Set(["completed", "failed", "refunded"]);

const orderKey = (id: string) => `aygo.pay.order.${id}`;
function savedOrder(id: string): string | null {
  try {
    return localStorage.getItem(orderKey(id));
  } catch {
    return null;
  }
}
function saveOrder(id: string, orderId: string | null) {
  try {
    if (orderId) localStorage.setItem(orderKey(id), orderId);
    else localStorage.removeItem(orderKey(id));
  } catch {
    /* private mode — the order still runs, it just isn't resumed after a reload */
  }
}

function codeOf(order: RampOrder): BankQrCode | null {
  const action = order.pendingAction;
  if (action?.kind !== "FIAT_PAYMENT") return null;
  const i = action.instructions;
  if (i.kind === "bank_transfer") return null; // not a scan-and-pay route
  if (i.kind === "hosted")
    return { image: null, payload: null, link: i.url, amount: i.amount, currency: i.currency, expiresAt: action.expiresAt };
  const img = i.scannable?.image;
  const image = img
    ? img.encoding === "base64"
      ? `data:${img.mediaType};base64,${img.data}`
      : `data:${img.mediaType};charset=utf-8,${encodeURIComponent(img.data)}`
    : null;
  return {
    image,
    payload: i.scannable?.payload ?? i.payload ?? null,
    link: i.link ?? null,
    amount: i.amount,
    currency: i.currency,
    expiresAt: action.expiresAt,
  };
}

/**
 * @param id      what the order is for (the event) — an open order is resumed
 * @param route   the BOB → USDC-on-Stellar route (null while unknown)
 * @param amount  Bolivianos to pay
 * @param onFunded called once the USDC has landed in the guest's wallet
 * @param openWidget opens Pollar's own window, for what a plain QR can't cover
 */
export function useBankQr(
  id: string,
  route: RampRoute | null,
  amount: number,
  onFunded: (amountOut: number | null) => void,
  openWidget: () => void,
): BankQr {
  const { getClient } = usePollar();
  const [step, setStep] = useState<BankQrStep>("idle");
  const [code, setCode] = useState<BankQrCode | null>(null);
  const [amountOut, setAmountOut] = useState<number | null>(null);
  const [etaSeconds, setEta] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsWidget, setNeedsWidget] = useState(false);
  const orderId = useRef<string | null>(null);
  const poll = useRef<AbortController | null>(null);
  const funded = useRef(onFunded);
  const widget = useRef(openWidget);
  useEffect(() => {
    funded.current = onFunded;
    widget.current = openWidget;
  });

  const stop = useCallback(() => {
    poll.current?.abort();
    poll.current = null;
  }, []);

  /** Reflect an order on screen. Returns true once nothing more will happen. */
  const show = useCallback(
    (order: RampOrder): boolean => {
      const last = order.legs[order.legs.length - 1];
      const out = Number(last?.amountOutActual ?? last?.amountOutPlanned);
      const delivered = Number.isFinite(out) && out > 0 ? out : null;
      setAmountOut(delivered);
      setEta(order.legs.reduce<number | null>((s, l) => (l.etaSeconds == null ? s : (s ?? 0) + l.etaSeconds), null));

      if (order.state === "completed") {
        saveOrder(id, null);
        setCode(null);
        setStep("funded");
        funded.current(delivered);
        return true;
      }
      if (order.state === "failed" || order.state === "refunded") {
        saveOrder(id, null);
        setCode(null);
        setError(
          order.state === "refunded"
            ? "That payment was refunded to your bank. Nothing was charged — try again."
            : "The payment couldn't be completed. If your bank charged you, it will be refunded.",
        );
        setStep("failed");
        return true;
      }
      const action = order.pendingAction;
      if (action?.kind === "FIAT_PAYMENT") {
        const c = codeOf(order);
        if (c) {
          setCode(c);
          setStep("scan");
          return false;
        }
      }
      // A signature, an approval, an identity check, bank coordinates…: more
      // than "scan and pay" — Pollar's window takes it from here.
      if (action && action.kind !== "NONE" && action.kind !== "FIAT_PAYMENT") setNeedsWidget(true);
      else if (action?.kind === "FIAT_PAYMENT") setNeedsWidget(true);
      setCode(null);
      setStep("converting");
      return false;
    },
    [id],
  );

  const follow = useCallback(
    (orderIdToFollow: string) => {
      stop();
      const ctrl = new AbortController();
      poll.current = ctrl;
      void getClient()
        .pollRampOrder(orderIdToFollow, {
          signal: ctrl.signal,
          onUpdate: (o) => void show(o),
          until: (o) => FINAL.has(o.state),
        })
        .then((o) => {
          if (!ctrl.signal.aborted) show(o);
        })
        .catch(() => {
          /* aborted, or the order is gone — the next start makes a new one */
        });
    },
    [getClient, show, stop],
  );

  // An order left open (a reload, a trip to the bank app) is picked up again.
  useEffect(() => {
    const open = savedOrder(id);
    if (!open || orderId.current) return;
    orderId.current = open;
    let cancelled = false;
    void getClient()
      .getRampOrder(open)
      .then((o) => {
        if (cancelled) return;
        if (!show(o)) follow(open);
      })
      .catch((e) => {
        if (cancelled) return;
        // Gone for this user → forget it. Anything else (a rate limit, the
        // network) → keep it and keep asking: money may be riding on it.
        if (isPollarApiError(e) && /NOT_FOUND/.test(e.code)) {
          saveOrder(id, null);
          orderId.current = null;
        } else follow(open);
      });
    return () => {
      cancelled = true;
    };
  }, [id, getClient, show, follow]);

  useEffect(() => stop, [stop]);

  const start = useCallback(async () => {
    if (!route || step === "starting") return;
    setError(null);
    setNeedsWidget(false);
    setStep("starting");
    try {
      const client = getClient();
      // Already an order for this ticket: show it again, never a second one.
      if (orderId.current) {
        const open = orderId.current;
        if (!show(await client.getRampOrder(open))) follow(open);
        return;
      }
      const quoted = await client.quoteRamp({
        direction: "ONRAMP",
        fiat: { currency: route.fiat.currency, rail: route.fiat.rail, country: route.fiat.country },
        asset: { code: route.asset.code, identifier: route.asset.identifier, chain: route.asset.chain },
        amount: { value: String(amount), denomination: "in" },
      });
      const quote = quoted.quotes[0];
      // No quote (a verification, a wallet to set up, a limit) or one that
      // asks the guest for details: Pollar's window handles those.
      if (!quote || rampQuoteFields(quote).length > 0) {
        setNeedsWidget(true);
        setStep("idle");
        widget.current();
        return;
      }
      const order = await client.createRampOrder({ quoteId: quote.quoteId });
      orderId.current = order.id;
      saveOrder(id, order.id);
      if (!show(order)) follow(order.id);
    } catch (e) {
      setStep(orderId.current ? "converting" : "idle");
      // Pollar's window is only for a step it asks of the guest (a wallet or a
      // verification behind "no route"). A rate limit or a bad connection is
      // just "try again".
      if (isPollarApiError(e) && e.code === "SDK_RAMPS_NO_ROUTE") {
        setNeedsWidget(true);
        widget.current();
        return;
      }
      setError(
        isPollarApiError(e) && e.code === "RATE_LIMITED"
          ? "Too many tries in a row — wait a minute and tap again."
          : "Couldn't get the bank QR. Check your connection and tap again.",
      );
    }
  }, [route, step, getClient, amount, id, show, follow]);

  const check = useCallback(async () => {
    if (!orderId.current) return;
    try {
      show(await getClient().checkRampOrder(orderId.current));
    } catch {
      /* the poll keeps asking */
    }
  }, [getClient, show]);

  const reset = useCallback(() => {
    stop();
    saveOrder(id, null);
    orderId.current = null;
    setCode(null);
    setError(null);
    setNeedsWidget(false);
    setStep("idle");
  }, [id, stop]);

  return {
    step,
    code,
    amountOut,
    etaSeconds,
    error,
    needsWidget,
    start: () => void start(),
    check: () => void check(),
    reset,
  };
}
