"use client";

// How a guest with a reserved spot settles a paid event. When the host takes
// payments in the app, that comes first: pay Bolivianos by bank QR (Pollar's
// ramp turns them into USDC in the guest's wallet) and send them to the host —
// the server confirms it on the ledger, nobody confirms by hand. The host's
// WhatsApp / link stay underneath as the other way to pay, and are all there
// is when in-app payments aren't available.

import { LuCheck, LuQrCode, LuRefreshCw, LuLoaderCircle, LuExternalLink } from "react-icons/lu";

import { Button } from "@/components/ui/button";
import { PayHostButtons, TicketContact } from "@/components/event/ticket-contact";
import { useAuth } from "@/hooks/use-auth";
import { useQrPay, type QrPay } from "@/hooks/use-qr-pay";
import { formatUsdc, txExplorerUrl } from "@/lib/stellar";
import type { AygoEvent } from "@/types";

const CAPTION = "text-[11px] leading-snug text-muted-foreground";

export function PaySection({ event }: { event: AygoEvent }) {
  const inApp = !!event.payment?.wallet;
  const pay = useQrPay(event, inApp);
  const hasOther = !!(event.payment?.whatsapp || event.payment?.link);

  if (inApp && pay.phase === "paid" && pay.receipt) {
    return (
      <div className="flex w-full flex-col items-center gap-1 pt-1">
        <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-gold px-3 text-[12.5px] font-bold text-navy">
          <LuCheck className="size-3.5" strokeWidth={2.5} aria-hidden />
          Paid · {formatUsdc(pay.receipt.amount)} USDC
        </span>
        <a
          href={txExplorerUrl(pay.receipt.txHash)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
        >
          Receipt <LuExternalLink className="size-3" aria-hidden />
        </a>
      </div>
    );
  }

  const offersInApp = inApp && pay.phase !== "unavailable";
  return (
    <div className="flex w-full flex-col items-center gap-2 pt-1">
      {offersInApp && <InAppPay event={event} pay={pay} />}
      {hasOther ? (
        <>
          <PayHostButtons event={event} prominent={!offersInApp} className="w-full" />
          {!offersInApp && (
            <p className={CAPTION}>
              Pay Bs {event.price} to {event.host.name} to keep your spot · they confirm it by hand
            </p>
          )}
        </>
      ) : (
        !offersInApp && <TicketContact event={event} />
      )}
    </div>
  );
}

function InAppPay({ event, pay }: { event: AygoEvent; pay: QrPay }) {
  const { openLoginModal } = useAuth();
  const working = pay.phase === "paying" || pay.phase === "confirming";

  return (
    <div className="flex w-full flex-col gap-2.5 rounded-2xl bg-card p-3.5 text-left ring-1 ring-border">
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
        <>
          <Button onClick={pay.topUp} className="h-11 w-full rounded-full text-[13.5px] font-semibold">
            <LuQrCode className="size-4" aria-hidden />
            Get the bank QR
          </Button>
          <p className={CAPTION}>
            Enter Bs {event.price}, scan the QR with your bank app, and come back here to
            finish — the Pay button appears once the money lands
            {pay.balance > 0 ? ` (you have ${formatUsdc(pay.balance.toFixed(2))} USDC)` : ""}.
          </p>
        </>
      )}

      {pay.error && (
        <p role="alert" className="text-[11.5px] font-medium text-amber-700">
          {pay.error}
        </p>
      )}
    </div>
  );
}
