import { LuMapPin } from "react-icons/lu";

import { EventMiniMap } from "@/components/event/event-mini-map";
import { GetDirections } from "@/components/event/get-directions";
import type { AygoEvent } from "@/types";

/**
 * Where it happens — address row, a real interactive mini-map (when the venue
 * is geocoded) in a navy-soft card, and one-tap directions into Google/Apple
 * Maps or Waze.
 */
export function EventLocation({ event }: { event: AygoEvent }) {
  const hasCoords = event.lat != null && event.lng != null;
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-gold-deep">
        Location
      </h2>

      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-foreground">
          <LuMapPin className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-foreground">
            {event.place}
          </p>
          <p className="truncate text-[12.5px] text-muted-foreground">
            {event.city}, Bolivia
          </p>
        </div>
      </div>

      {hasCoords && (
        <EventMiniMap lat={event.lat!} lng={event.lng!} label={event.place} />
      )}

      <GetDirections event={event} />
    </section>
  );
}
