import { LuMapPin, LuArrowUpRight } from "react-icons/lu";

import type { AygoEvent } from "@/types";

/** Where it happens — address row + an embedded map, flat on the page (no card). */
export function EventLocation({ event }: { event: AygoEvent }) {
  const query = encodeURIComponent(`${event.place}, ${event.city}, Bolivia`);
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-[10.5px] font-semibold uppercase tracking-wider text-amber-600">
        Location
      </h2>

      <a
        href={`https://maps.google.com/?q=${query}`}
        target="_blank"
        rel="noreferrer"
        className="group flex items-start gap-3"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
          <LuMapPin className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 text-[14px] font-semibold text-foreground">
            {event.place}
            <LuArrowUpRight
              className="size-3.5 text-muted-foreground transition-colors group-hover:text-foreground"
              aria-hidden
            />
          </p>
          <p className="truncate text-[12.5px] text-muted-foreground">
            {event.city}, Bolivia
          </p>
        </div>
      </a>

      <iframe
        title={`Map showing ${event.place}`}
        src={`https://www.google.com/maps?q=${query}&output=embed`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-44 w-full rounded-2xl ring-1 ring-border"
      />
    </section>
  );
}
