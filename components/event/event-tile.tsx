import Link from "next/link";
import { LuMapPin } from "react-icons/lu";

import { Badge } from "@/components/ui/badge";
import { CATEGORY_META, eventCode } from "@/lib/events-data";
import { cn } from "@/lib/utils";
import type { AygoEvent } from "@/types";

/** Compact horizontal-scroll card for recommendation rows. */
export function EventTile({ event }: { event: AygoEvent }) {
  const { Icon, accent } = CATEGORY_META[event.category];
  const paid = event.price != null && event.price > 0;
  return (
    <Link
      href={`/${eventCode(event.id)}`}
      className="block w-44 shrink-0 overflow-hidden rounded-2xl bg-card ring-1 ring-border transition-colors hover:bg-muted/60"
    >
      <div className="relative aspect-[4/3]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={event.cover}
          alt=""
          className="size-full object-cover"
          style={event.coverPosition ? { objectPosition: event.coverPosition } : undefined}
        />
        <Badge className="absolute left-2 top-2 border-transparent bg-black/55 text-white backdrop-blur">
          {event.dayLabel}
        </Badge>
      </div>
      <div className="flex flex-col gap-1 p-2.5">
        <p className="line-clamp-2 text-[13px] font-semibold leading-tight text-foreground">
          {event.title}
        </p>
        <p className="flex items-center gap-1 text-[11.5px] text-muted-foreground">
          <Icon className={cn("size-3.5 shrink-0", accent)} aria-hidden />
          <span className="truncate">{event.timeLabel} · {paid ? `Bs ${event.price}` : "Free"}</span>
        </p>
        <p className="flex items-center gap-1 text-[11.5px] text-muted-foreground">
          <LuMapPin className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">{event.city}</span>
        </p>
      </div>
    </Link>
  );
}
