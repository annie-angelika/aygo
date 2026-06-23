import { LuShare2 } from "react-icons/lu";

import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/ui/back-button";
import { ShareButton } from "@/components/ui/share-button";
import { CategoryChip } from "@/components/event/category-chip";
import { EventDetailMeta } from "@/components/event/event-detail-meta";
import { EventLocation } from "@/components/event/event-location";
import { HostCard } from "@/components/event/host-card";
import { GoingSection } from "@/components/event/going-section";
import { EventHelp } from "@/components/event/event-help";
import { EventActions } from "@/components/event/event-actions";
import { SiteFooter } from "@/components/layout/site-footer";
import { attendeesFor } from "@/lib/users-data";
import type { AygoEvent } from "@/types";

export function EventDetail({ event }: { event: AygoEvent }) {
  const free = event.price == null;
  const going = attendeesFor(event.id);
  return (
    <div className="min-h-svh pb-32">
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

      <div className="relative h-[300px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={event.cover} alt="" className="size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-background" />
      </div>

      <div className="relative -mt-10 flex flex-col gap-4 px-5">
        <div>
          <div className="flex items-center gap-2">
            <CategoryChip category={event.category} />
            <Badge variant={free ? "secondary" : "default"}>
              {free ? "Free" : `Bs ${event.price}`}
            </Badge>
          </div>
          <h1 className="mt-2 text-[24px] font-semibold leading-tight tracking-tight text-foreground">
            {event.title}
          </h1>
        </div>

        <EventDetailMeta event={event} />

        <div className="flex flex-col divide-y divide-border">
          <section className="flex flex-col gap-2 pb-5">
            <h2 className="text-[10.5px] font-semibold uppercase tracking-wider text-amber-600">
              About
            </h2>
            {event.blurb.split("\n\n").map((para, i) => (
              <p
                key={i}
                className="text-[14px] leading-relaxed text-foreground/80"
              >
                {para}
              </p>
            ))}
          </section>

          <div className="py-5">
            <EventLocation event={event} />
          </div>

          <div className="pt-5">
            <HostCard event={event} />
          </div>

          <div className="flex flex-col gap-5 py-5">
            <GoingSection event={event} people={going} />
            <EventHelp event={event} />
          </div>
        </div>
      </div>

      <SiteFooter />

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/90 px-5 pb-6 pt-3 backdrop-blur">
        <div className="mx-auto w-full max-w-md">
          <EventActions event={event} />
        </div>
      </div>
    </div>
  );
}
