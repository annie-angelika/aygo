"use client";

import { useState } from "react";
import Link from "next/link";
import { LuLink, LuCheck, LuArrowUpRight } from "react-icons/lu";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EventDetailBody } from "@/components/event/event-detail-body";
import { EventActions } from "@/components/event/event-actions";
import { eventCode } from "@/lib/events-data";
import type { AygoEvent } from "@/types";

/**
 * Near-fullscreen quick view of an event, opened from a map pin so you can scan
 * an event without leaving the map. Shows the exact same body as the event page,
 * plus a header to copy the link or jump to the full page, and the sticky RSVP
 * action at the bottom. Controlled: render with `event` to open, `onClose` to dismiss.
 */
export function EventPreviewDialog({
  event,
  onClose,
}: {
  event: AygoEvent | null;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const href = event ? `/${eventCode(event.id)}` : "";

  const copyLink = async () => {
    if (!event || typeof window === "undefined") return;
    try {
      await navigator.clipboard?.writeText(`${window.location.origin}${href}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked — ignore */
    }
  };

  return (
    <Dialog open={Boolean(event)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex h-[92svh] max-h-[92svh] w-[calc(100%-1.5rem)] max-w-md -translate-y-1/2 flex-col gap-0 overflow-hidden bg-background p-0">
        {event && (
          <>
            <DialogTitle className="sr-only">{event.title}</DialogTitle>

            {/* Header: copy link / open the full page. Leaves room for the X. */}
            <div className="flex shrink-0 items-center gap-2 border-b border-border bg-background/90 px-3 py-2.5 pr-14 backdrop-blur">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copyLink}
                className="rounded-full"
              >
                {copied ? (
                  <LuCheck className="text-gold-deep" aria-hidden />
                ) : (
                  <LuLink aria-hidden />
                )}
                {copied ? "Copied" : "Copy Link"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<Link href={href} />}
                className="rounded-full"
              >
                Event Page
                <LuArrowUpRight aria-hidden />
              </Button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-4">
              <EventDetailBody event={event} />
            </div>

            <div className="shrink-0 border-t border-border bg-background/90 px-5 pb-4 pt-3 backdrop-blur">
              <EventActions event={event} />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
