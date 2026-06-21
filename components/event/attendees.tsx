import { AvatarStack } from "@/components/ui/avatar-stack";
import { cn } from "@/lib/utils";
import type { AygoEvent } from "@/types";

/** Social proof: stacked faces + a "N going" count. */
export function Attendees({
  event,
  className,
}: {
  event: AygoEvent;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <AvatarStack srcs={event.attendeeAvatars} total={event.attendees} max={3} />
      <span className="text-[12px] font-medium text-muted-foreground">
        {event.attendees} going
      </span>
    </div>
  );
}
