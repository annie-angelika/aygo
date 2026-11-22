import Link from "next/link";
import { LuMapPin } from "react-icons/lu";

import { Card } from "@/components/ui/card";
import { GoingBadge } from "@/components/event/going-badge";
import { ThemeCover } from "@/components/event/theme-cover";
import { CATEGORY_META, eventCode } from "@/lib/events-data";
import { cn } from "@/lib/utils";
import type { AygoEvent } from "@/types";

/**
 * Luma-style list row, aygo edition. The category leads — a navy badge with a
 * gold icon and the interest's name — so you know what an event *is* before
 * you read its title. Then the title, place · host, and your status.
 */
export function EventRow({
  event,
  going,
}: {
  event: AygoEvent;
  going?: boolean;
}) {
  const free = !(event.price != null && event.price > 0);
  const { Icon } = CATEGORY_META[event.category];

  return (
    <Link href={`/${eventCode(event.id)}`} className="block">
      <Card className="p-3 ring-foreground/8 transition-colors hover:bg-accent/40 [--card-spacing:0px]">
        <div className="flex items-center gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground">
              <span className="inline-flex h-[22px] items-center gap-1.5 rounded-full bg-primary pl-1.5 pr-2 text-[11px] font-bold tracking-[0.02em] text-primary-foreground">
                <Icon className="size-[13px] text-gold" aria-hidden />
                {event.category}
              </span>
              <span aria-hidden>·</span>
              <span>{event.timeLabel}</span>
            </div>
            <h3 className="truncate text-[15px] font-semibold leading-tight text-foreground">
              {event.title}
            </h3>
            <div className="flex min-w-0 items-center gap-1.5 text-[12.5px] text-muted-foreground">
              <LuMapPin className="size-[13px] shrink-0" aria-hidden />
              <span className="min-w-0 truncate">{event.place}</span>
              <span aria-hidden>·</span>
              <span className="min-w-0 shrink-[2] truncate">By {event.host.name}</span>
            </div>
            <div className="mt-0.5 flex items-center gap-2">
              {going ? (
                <GoingBadge event={event} />
              ) : (
                <span
                  className={cn(
                    "inline-flex h-[22px] items-center rounded-full px-2 text-[11.5px] font-semibold text-foreground",
                    free ? "bg-secondary" : "bg-card ring-1 ring-border",
                  )}
                >
                  {free ? "Free" : `Bs ${event.price}`}
                </span>
              )}
            </div>
          </div>
          {event.cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.cover}
              alt=""
              className="size-20 shrink-0 self-center rounded-[14px] object-cover"
            />
          ) : (
            <ThemeCover theme={event.theme} className="size-20 shrink-0 self-center rounded-[14px]" />
          )}
        </div>
      </Card>
    </Link>
  );
}
