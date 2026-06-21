import Link from "next/link";
import { LuClock, LuCheck } from "react-icons/lu";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { AvatarStack } from "@/components/ui/avatar-stack";
import { CATEGORY_META } from "@/lib/events-data";
import { cn } from "@/lib/utils";
import type { AygoEvent } from "@/types";

/** Luma-style list row: time, title, host + place, attendees, thumbnail. */
export function EventRow({
  event,
  going,
}: {
  event: AygoEvent;
  going?: boolean;
}) {
  const free = event.price == null;
  const { Icon, accent } = CATEGORY_META[event.category];

  return (
    <Link href={`/event/${event.id}`} className="block">
      <Card className="p-3 transition-colors hover:bg-accent/40 [--card-spacing:0px]">
        <div className="flex items-stretch gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[12.5px] font-medium text-muted-foreground">
              <LuClock className="size-3.5" aria-hidden />
              {event.timeLabel}
            </div>
            <h3 className="mt-1 line-clamp-2 text-[15px] font-semibold leading-tight text-foreground">
              {event.title}
            </h3>
            <div className="mt-1.5 flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
              <Avatar size="sm" className="size-4">
                <AvatarImage src={event.host.avatar} alt="" />
              </Avatar>
              <span className="truncate">By {event.host.name}</span>
              <span aria-hidden>·</span>
              <Icon className={cn("size-3.5 shrink-0", accent)} aria-hidden />
              <span className="truncate">{event.place}</span>
            </div>
            <div className="mt-2.5 flex items-center gap-2">
              <AvatarStack
                srcs={event.attendeeAvatars}
                total={event.attendees}
                max={3}
              />
              {going ? (
                <Badge className="gap-1 border-transparent bg-emerald-100 text-emerald-700">
                  <LuCheck className="size-3" />
                  Going
                </Badge>
              ) : (
                <Badge variant={free ? "secondary" : "outline"}>
                  {free ? "Free" : `Bs ${event.price}`}
                </Badge>
              )}
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.cover}
            alt=""
            className="size-20 shrink-0 self-center rounded-xl object-cover"
          />
        </div>
      </Card>
    </Link>
  );
}
