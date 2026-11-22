"use client";

// How a guest with a reserved spot settles a paid event. When the host takes
// payments in the app, that comes first: pay Bolivianos by bank QR (Pollar's
// ramp turns them into USDC in the guest's wallet) and send them to the host —
// the server confirms it on the ledger, nobody confirms by hand. Such an event
// is paid ONLY that way. The host's WhatsApp / link are for events that never
// turned in-app payments on.

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { LuCheck, LuQrCode, LuRefreshCw, LuLoaderCircle, LuExternalLink } from "react-icons/lu";

import { Button } from "@/components/ui/button";
import { PayHostButtons, TicketContact } from "@/components/event/ticket-contact";
import { WalletSetupNote } from "@/components/payment/wallet-setup-note";
import { useAuth } from "@/hooks/use-auth";
import { useQrPay, type QrPay } from "@/hooks/use-qr-pay";
import type { BankQrCode } from "@/hooks/use-bank-qr";
import { formatUsdc, txExplorerUrl, usdcLabel } from "@/lib/stellar";
import type { AygoEvent } from "@/types";

const CAPTION = "text-[11px] leading-snug text-muted-foreground";

export function PaySection({
  event,
  settled = false,
}: {
  event: AygoEvent;
  /** The payment is already confirmed (only a receipt is left to show). */
  settled?: boolean;
}) {
  const inApp = !!event.payment?.wallet;
  const pay = useQrPay(event, inApp);
  const hasOther = !!(event.payment?.whatsapp || event.payment?.link);

  // Paid: the gold "You're going!" above already says it — this is the quiet
  // proof underneath (what was paid, and the receipt on the public ledger).
  if (inApp && pay.phase === "paid" && pay.receipt) {
    return (
      <p className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 pt-0.5 text-[12px] text-muted-foreground">
        <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
          <LuCheck className="size-3.5" strokeWidth={2.5} aria-hidden />
          Paid Bs {event.price}
        </span>
        <span aria-hidden>·</span>
        <span>{usdcLabel(pay.receipt.amount)}</span>
        <span aria-hidden>·</span>
        <a
          href={txExplorerUrl(pay.receipt.txHash)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 font-medium text-foreground underline-offset-2 hover:underline"
        >
          Receipt <LuExternalLink className="size-3" aria-hidden />
        </a>
      </p>
    );
  }

  // Confirmed by the host by hand: nothing left to pay, no receipt to show.
  if (settled) return null;

  // An event that takes payments in the app is paid ONLY there: the bank QR is
  // the one way in, with no side channel to settle by hand. The host's
  // WhatsApp / link are for events that never turned in-app payments on.
  if (inApp) {
    return (
      <div className="flex w-full flex-col items-center gap-2 pt-1">
        {pay.phase === "unavailable" ? <PayUnavailable event={event} pay={pay} /> : <InAppPay event={event} pay={pay} />}
      </div>
    );
  }
  return (
    <div className="flex w-full flex-col items-center gap-2 pt-1">
      {hasOther ? (
        <>
          <PayHostButtons event={event} prominent className="w-full" />
          <p className={CAPTION}>
            Pay Bs {event.price} to {event.host.name} · you&apos;re going once they confirm it
          </p>
        </>
      ) : (
        <TicketContact event={event} />
      )}
    </div>
  );
}

/** In-app payment is on for the event but can't run right now — say why. */
function PayUnavailable({ event, pay }: { event: AygoEvent; pay: QrPay }) {
  return (
    <div data-pay-card className="flex w-full flex-col gap-2 rounded-2xl bg-card p-3.5 text-left ring-1 ring-border">
      <p className="text-[13.5px] font-semibold text-foreground">
        {`Paying Bs ${event.price} by bank QR isn't ready yet`}
      </p>
      <p className={CAPTION}>
        {pay.blocked === "host-wallet"
          ? `${event.host.name}'s wallet can't receive payments yet. Your spot stays reserved — try again in a bit.`
          : pay.error ?? "Bank QR payments aren't available right now. Your spot stays reserved — try again in a bit."}
      </p>
      {/* The wallet's own owner finishes its setup right here. */}
      <WalletSetupNote wallet={event.payment?.wallet} />
      <button
        type="button"
        onClick={pay.refresh}
        className="inline-flex items-center gap-1.5 self-start text-[12px] font-semibold text-foreground"
      >
        <LuRefreshCw className="size-3.5" aria-hidden />
        Check again
      </button>
    </div>
  );
}

function InAppPay({ event, pay }: { event: AygoEvent; pay: QrPay }) {
  const { openLoginModal } = useAuth();
  const working = pay.phase === "paying" || pay.phase === "confirming";

  return (
    <div data-pay-card className="flex w-full flex-col gap-2.5 rounded-2xl bg-card p-3.5 text-left ring-1 ring-border">
      <div className="flex items-center gap-2.5">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-gold">
          <LuQrCode className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-semibold text-foreground">
            Pay Bs {event.price} in the app
          </p>
          <p className={CAPTION}>
            {pay.due != null
              ? `≈ ${formatUsdc(pay.due.toFixed(2))} USDC, straight to ${event.host.name}'s wallet`
              : `By bank QR, straight to ${event.host.name}'s wallet`}
          </p>
        </div>
        {pay.phase === "ready" && (
          <button
            type="button"
            onClick={pay.refresh}
            aria-label="Refresh"
            className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LuRefreshCw className="size-4" aria-hidden />
          </button>
        )}
      </div>

      {pay.phase === "loading" ? (
        <div className="h-11 w-full animate-pulse rounded-full bg-muted" />
      ) : pay.phase === "signin" ? (
        <Button onClick={openLoginModal} className="h-11 w-full rounded-full text-[13.5px] font-semibold">
          Sign in again to pay
        </Button>
      ) : working ? (
        <p className="inline-flex h-11 items-center justify-center gap-2 text-[13px] font-medium text-foreground">
          <LuLoaderCircle className="size-4 animate-spin" aria-hidden />
          {pay.phase === "paying" ? "Sending your payment…" : "Confirming on the network…"}
        </p>
      ) : pay.enough ? (
        <Button onClick={pay.pay} className="h-11 w-full rounded-full text-[13.5px] font-semibold">
          Pay now
        </Button>
      ) : (
        <BankQrPay event={event} pay={pay} />
      )}

      {pay.error && (
        <p role="alert" className="text-[11.5px] font-medium text-amber-700">
          {pay.error}
        </p>
      )}
    </div>
  );
}

/** Scan, pay, done: the bank QR for exactly this ticket, then what happens to it. */
function BankQrPay({ event, pay }: { event: AygoEvent; pay: QrPay }) {
  const { qr } = pay;

  if (qr.step === "scan" && qr.code) {
    return (
      <div className="flex flex-col items-center gap-2.5">
        <QrPicture code={qr.code} />
        <p className="text-center text-[13px] font-semibold text-foreground">
          Scan with your bank app · Bs {qr.code.amount}
        </p>
        <p className={`text-center ${CAPTION}`}>
          Pay it and stay on this page — your spot confirms by itself.
        </p>
        <div className="flex items-center gap-4">
          <button type="button" onClick={qr.check} className="text-[12px] font-semibold text-foreground">
            I&apos;ve paid
          </button>
          <button type="button" onClick={qr.reset} className="text-[12px] font-medium text-muted-foreground">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (qr.step === "converting" || qr.step === "funded") {
    const minutes = qr.etaSeconds ? Math.max(1, Math.round(qr.etaSeconds / 60)) : null;
    return (
      <div className="flex flex-col gap-2">
        <p className="inline-flex min-h-11 items-center justify-center gap-2 text-center text-[13px] font-medium text-foreground">
          <LuLoaderCircle className="size-4 shrink-0 animate-spin" aria-hidden />
          {qr.step === "funded"
            ? `Sending it to ${event.host.name}…`
            : qr.needsWidget
              ? "One more step to finish your payment"
              : `Payment received — finishing up${minutes ? ` (about ${minutes} min)` : ""}`}
        </p>
        {qr.needsWidget && qr.step === "converting" && (
          <Button onClick={pay.openWidget} className="h-11 w-full rounded-full text-[13.5px] font-semibold">
            Continue
          </Button>
        )}
        {qr.step === "converting" && !qr.needsWidget && (
          <p className={`text-center ${CAPTION}`}>
            You can leave this page; it finishes when you come back.
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      {/* One button, one label. When Pollar asks for a step a plain QR can't
          cover (see use-bank-qr), the same tap opens its window instead. */}
      <Button
        onClick={qr.needsWidget ? pay.openWidget : qr.start}
        disabled={qr.step === "starting"}
        className="h-11 w-full rounded-full text-[13.5px] font-semibold"
      >
        {qr.step === "starting" ? (
          <LuLoaderCircle className="size-4 animate-spin" aria-hidden />
        ) : (
          <LuQrCode className="size-4" aria-hidden />
        )}
        {qr.step === "starting" ? "Getting your QR…" : `Pay Bs ${event.price} by bank QR`}
      </Button>
      {qr.needsWidget && (
        <p className={CAPTION}>
          Your wallet needs a one-time setup before its first bank QR — tap to finish it.
        </p>
      )}
      {qr.error && !qr.needsWidget && (
        <p role="alert" className="text-[11.5px] font-medium text-amber-700">
          {qr.error}
        </p>
      )}
    </>
  );
}

/** The code itself: Pollar's picture of it, or one drawn from its payload. */
function QrPicture({ code }: { code: BankQrCode }) {
  const [drawn, setDrawn] = useState<string | null>(null);
  const { image, payload, link } = code;
  useEffect(() => {
    if (image || !payload) return;
    let cancelled = false;
    QRCode.toDataURL(payload, { errorCorrectionLevel: "M", margin: 1, width: 512 })
      .then((d) => {
        if (!cancelled) setDrawn(d);
      })
      .catch(() => {
        if (!cancelled) setDrawn(null);
      });
    return () => {
      cancelled = true;
    };
  }, [image, payload]);

  const src = image ?? drawn;
  if (!src) {
    return link ? (
      <a
        href={link}
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-[13.5px] font-semibold text-primary-foreground"
      >
        Open the payment page <LuExternalLink className="size-4" aria-hidden />
      </a>
    ) : (
      <div className="size-56 animate-pulse rounded-2xl bg-muted" />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- a data: URI from the payment provider
    <img
      src={src}
      alt="Bank QR code for this payment"
      className="size-56 rounded-2xl bg-white p-2 ring-1 ring-border"
    />
  );
}
