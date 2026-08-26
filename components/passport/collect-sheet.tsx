"use client";

import { useState } from "react";
import { LuLoaderCircle, LuQrCode, LuTriangleAlert } from "react-icons/lu";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrScanner } from "@/components/passport/qr-scanner";
import { AygoStamp } from "@/components/passport/aygo-stamp";
import { AygoStar } from "@/components/ui/brand-icons";
import { useRegistrations } from "@/hooks/use-registrations";
import { fetchEventByCode, collectStamp } from "@/lib/api";
import type { AygoEvent, Stamp } from "@/types";

/**
 * Collect an aygo by scanning the event's QR at the door — the only method,
 * and a real one: the QR carries the event's share link, the code resolves the
 * event, and the server grants the stamp only to a registered guest once the
 * event has started (POST /me/stamps). Anything else — a random QR, an event
 * you're not registered for, one that hasn't begun — is refused with the
 * server's reason.
 */
type Step =
  | { kind: "scan" }
  | { kind: "checking" }
  | { kind: "done"; event: AygoEvent; stamp: Stamp }
  | { kind: "error"; message: string };

export function CollectSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="gap-0 p-5">
        {/* Keyed on `open` so every open starts at the scanner. */}
        {open && <CollectFlow onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}

/** The event's share code from whatever the QR held: our URL, or the bare code. */
function codeFromScan(value: string): string | null {
  const text = value.trim();
  try {
    const url = new URL(text);
    const last = url.pathname.split("/").filter(Boolean).pop() ?? "";
    return /^[a-z0-9]{6,12}$/i.test(last) ? last : null;
  } catch {
    return /^[a-z0-9]{6,12}$/i.test(text) ? text : null;
  }
}

function CollectFlow({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<Step>({ kind: "scan" });
  const { addStamp } = useRegistrations();

  async function onScan(value: string) {
    if (step.kind !== "scan") return;
    const code = codeFromScan(value);
    if (!code) {
      setStep({ kind: "error", message: "That QR isn't an aygo event. Ask the host for theirs." });
      return;
    }
    setStep({ kind: "checking" });
    try {
      const event = await fetchEventByCode(code);
      if (!event) throw new Error("That event doesn't exist any more.");
      // The server decides: registered guest + event started, or a clear no.
      await collectStamp(event.id);
      addStamp(event);
      setStep({
        kind: "done",
        event,
        stamp: {
          eventId: event.id,
          title: event.title,
          category: event.category,
          image: event.cover,
          city: event.city,
          earnedAt: new Date().toISOString(),
        },
      });
    } catch (err) {
      setStep({
        kind: "error",
        message:
          err instanceof Error && err.message
            ? err.message
            : "Couldn't check you in — try again.",
      });
    }
  }

  if (step.kind === "done") {
    return (
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-gold-deep">
          Checked in · new aygo
        </p>
        <AygoStamp stamp={step.stamp} size="lg" />
        <DialogTitle className="mt-1 text-[18px] font-bold tracking-[-0.03em]">
          {step.event.title}
        </DialogTitle>
        <DialogDescription className="max-w-[30ch]">
          It&apos;s in your collection now. Keep showing up to earn more.
        </DialogDescription>
        <Button size="lg" onClick={onClose} className="h-12 w-full rounded-full text-[14px]">
          Done
        </Button>
      </div>
    );
  }

  if (step.kind === "error") {
    return (
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-secondary text-foreground">
          <LuTriangleAlert className="size-6" aria-hidden />
        </span>
        <DialogTitle className="text-[18px] font-bold tracking-[-0.03em]">
          Not this time
        </DialogTitle>
        <DialogDescription className="max-w-[32ch]">{step.message}</DialogDescription>
        <Button
          size="lg"
          onClick={() => setStep({ kind: "scan" })}
          className="h-12 w-full rounded-full text-[14px]"
        >
          Scan again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2.5 pt-1 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-secondary text-foreground">
        <LuQrCode className="size-6" aria-hidden />
      </span>
      <DialogTitle className="text-[16px] font-bold tracking-[-0.03em]">
        Point at the event&apos;s QR
      </DialogTitle>
      <DialogDescription className="max-w-[30ch] leading-snug">
        The host shows it at the door. One scan checks you in and drops the aygo
        in your collection.
      </DialogDescription>
      <div className="relative mt-1.5 w-full">
        <QrScanner onScan={onScan} />
        {step.kind === "checking" && (
          <div className="absolute inset-0 grid place-items-center rounded-2xl bg-navy/70 text-cream">
            <span className="inline-flex items-center gap-2 text-[13px] font-semibold">
              <LuLoaderCircle className="size-4 animate-spin text-gold" aria-hidden />
              Checking you in…
            </span>
          </div>
        )}
      </div>
      <p className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
        <AygoStar className="size-3 text-gold" />
        Only registered guests can collect, once the event has started.
      </p>
    </div>
  );
}
