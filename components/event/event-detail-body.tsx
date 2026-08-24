import { Badge } from "@/components/ui/badge";
import { CategoryChip } from "@/components/event/category-chip";
import { EventDetailMeta } from "@/components/event/event-detail-meta";
import { EventLocation } from "@/components/event/event-location";
import { HostCard } from "@/components/event/host-card";
import { GoingSection } from "@/components/event/going-section";
import { EventHelp } from "@/components/event/event-help";
import { EventGallery } from "@/components/event/event-gallery";
import { ManageBanner } from "@/components/manage/manage-banner";
import type { AygoEvent } from "@/types";

/**
 * The scrollable detail content — cover banner + all the sections — shared by
 * the full event page and the map quick-preview dialog so both show exactly the
 * same thing. It owns no chrome (back/share), no sticky actions and no footer;
 * the surrounding shell supplies those.
 */
export function EventDetailBody({ event }: { event: AygoEvent }) {
  const free = !(event.price != null && event.price > 0);
  return (
    <>
      <EventGallery event={event} />

      <div className="relative -mt-10 flex flex-col gap-4 px-5">
        <ManageBanner eventId={event.id} />
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
            <GoingSection event={event} />
            <EventHelp event={event} />
          </div>
        </div>
      </div>
    </>
  );
}
