import { LuMapPin } from "react-icons/lu";
import { cn } from "@/lib/utils";
import type { AygoEvent } from "@/types";

/** When + where, on one wrapping line. Reused in card and detail. */
export function EventMeta({
  event,
  className,
}: {
  event: AygoEvent;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-muted-foreground",
        className,
      )}
    >
      <span className="font-medium text-foreground/80">
        {event.dayLabel} · {event.timeLabel}
      </span>
      <span aria-hidden>·</span>
      <span className="inline-flex items-center gap-1">
        <LuMapPin className="size-3.5 shrink-0" aria-hidden />
        {event.place}, {event.city}
      </span>
    </div>
  );
}
