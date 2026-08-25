"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

import { AygoStar } from "@/components/ui/brand-icons";
import { eventCode } from "@/lib/events-data";
import { cn } from "@/lib/utils";

/**
 * The event's check-in QR for the host to show at the door (or on a screen).
 * It encodes the event's own share link, so any phone camera opens the event
 * page and the aygo app's Collect scanner checks the guest in. Rendered
 * client-side (needs `window.location.origin`), navy on cream.
 */
export function EventQr({ eventId, className }: { eventId: string; className?: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const code = eventCode(eventId);

  useEffect(() => {
    let cancelled = false;
    const url = `${window.location.origin}/${code}`;
    QRCode.toDataURL(url, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 512,
      color: { dark: "#091935", light: "#ffffff" },
    })
      .then((data) => {
        if (!cancelled) setSrc(data);
      })
      .catch(() => {
        if (!cancelled) setSrc(null);
      });
    return () => {
      cancelled = true;
    };
  }, [code]);

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative rounded-2xl bg-white p-3 ring-1 ring-border">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={`Check-in QR for this event (code ${code})`} className="size-44" />
        ) : (
          <div className="size-44 rounded-lg bg-secondary" aria-hidden />
        )}
        <span className="absolute -right-2 -top-2 grid size-7 place-items-center rounded-full bg-gold ring-2 ring-background">
          <AygoStar className="size-4 text-navy" />
        </span>
      </div>
      <p className="text-[12px] font-semibold tracking-[0.12em] text-muted-foreground">
        AYGO · {code.toUpperCase()}
      </p>
    </div>
  );
}
