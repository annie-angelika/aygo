import { AvatarStack } from "@/components/ui/avatar-stack";
import { cn } from "@/lib/utils";
import type { AygoEvent } from "@/types";

/** Social proof — real RSVPs only. Zero renders an invite, not fake faces. */
export function Attendees({
  event,
  className,
}: {
  event: AygoEvent;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {event.attendees > 0 && (
        <AvatarStack srcs={event.attendeeAvatars} total={event.attendees} max={3} />
      )}
      <span className="text-[12px] font-medium text-muted-foreground">
        {event.attendees > 0 ? `${event.attendees} going` : "Be the first to join"}
      </span>
    </div>
  );
}
