import { LuShare2 } from "react-icons/lu";

import { BackButton } from "@/components/ui/back-button";
import { ShareButton } from "@/components/ui/share-button";
import { EventDetailBody } from "@/components/event/event-detail-body";
import { EventActions } from "@/components/event/event-actions";
import { SiteFooter } from "@/components/layout/site-footer";
import type { AygoEvent } from "@/types";

export function EventDetail({ event }: { event: AygoEvent }) {
  return (
    // overflow-x-hidden: this is a full-bleed immersive screen (like /create) —
    // guard against any child nudging past the viewport and scrolling the whole
    // page sideways, which clips every row on the left at mobile widths.
    <div className="flex min-h-svh flex-col overflow-x-hidden pb-32">
      {/* Always-on-top controls — stay pinned as the page scrolls. */}
      <div className="fixed inset-x-0 top-0 z-40 px-4 pt-4">
        <div className="mx-auto flex w-full max-w-md items-center justify-between">
          <BackButton className="ring-1 ring-border" />
          <ShareButton
            title={event.title}
            text={`Check out "${event.title}" on aygo`}
            copiedLabel="✓"
            className="grid size-9 place-items-center rounded-full bg-background/80 text-foreground ring-1 ring-border backdrop-blur active:scale-95"
          >
            <LuShare2 className="size-4" aria-hidden />
          </ShareButton>
        </div>
      </div>

      <EventDetailBody event={event} />

      <div className="mt-auto">
        <SiteFooter compact />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/90 px-5 pb-6 pt-3 backdrop-blur">
        <div className="mx-auto w-full max-w-md">
          <EventActions event={event} />
        </div>
      </div>
    </div>
  );
}
