import { CategoryChip } from "@/components/event/category-chip";
import { EventDetailMeta } from "@/components/event/event-detail-meta";
import { EventLocation } from "@/components/event/event-location";
import { HostCard } from "@/components/event/host-card";
import { GoingSection } from "@/components/event/going-section";
import { EventHelp } from "@/components/event/event-help";
import { EventGallery } from "@/components/event/event-gallery";
import { ManageBanner } from "@/components/manage/manage-banner";
import { cn } from "@/lib/utils";
import type { AygoEvent } from "@/types";

/**
 * The scrollable detail content — cover banner + all the sections — shared by
 * the full event page and the map quick-preview dialog so both show exactly the
 * same thing. It owns no chrome (back/share), no sticky actions and no footer;
 * the surrounding shell supplies those.
 *
 * `wide` is the full page's desktop treatment (from `lg`): the cover becomes a
 * rounded card, the copy loses its side padding (the page grid supplies it) and
 * the when/where tiles hide here because the page repeats them in its sticky
 * side card. The phone-width preview sheet leaves it off so the viewport
 * breakpoint never reshapes its narrow frame.
 */
export function EventDetailBody({
  event,
  wide = false,
}: {
  event: AygoEvent;
  wide?: boolean;
}) {
  const free = !(event.price != null && event.price > 0);
  return (
    <>
      <EventGallery event={event} wide={wide} />

      <div
        className={cn(
          "relative -mt-10 flex flex-col gap-4 px-5",
          wide && "lg:mt-6 lg:gap-5 lg:px-0",
        )}
      >
        <ManageBanner eventId={event.id} />
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <CategoryChip category={event.category} />
            <span
              className={cn(
                "inline-flex h-6 items-center rounded-full px-2.5 text-[11.5px] font-semibold text-foreground",
                free ? "bg-secondary" : "bg-card ring-1 ring-border",
              )}
            >
              {free ? "Free" : `Bs ${event.price}`}
            </span>
          </div>
          <h1
            className={cn(
              "text-[28px] font-bold leading-[1.15] tracking-[-0.03em] text-foreground",
              wide && "lg:text-[36px]",
            )}
          >
            {event.title}
          </h1>
        </div>

        <div className={cn(wide && "lg:hidden")}>
          <EventDetailMeta event={event} />
        </div>

        <div className="flex flex-col divide-y divide-border">
          <section className="flex flex-col gap-2 pb-5">
            <h2 className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-gold-deep">
              About
            </h2>
            {event.blurb.split("\n\n").map((para, i) => (
              <p
                key={i}
                className={cn(
                  "text-[14px] leading-relaxed text-foreground/80",
                  wide && "lg:max-w-2xl lg:text-[15px]",
                )}
              >
                {para}
              </p>
            ))}
          </section>

          <div className="py-5">
            <EventLocation event={event} />
          </div>

          <div className="py-5">
            <HostCard event={event} />
          </div>

          <div className="flex flex-col gap-5 pt-5">
            <GoingSection event={event} />
            <EventHelp event={event} />
          </div>
        </div>
      </div>
    </>
  );
}
