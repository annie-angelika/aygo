import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";
import type { AygoEvent } from "@/types";

/**
 * The event's organizer — exactly what the event record carries, nothing
 * invented. Hosts aren't user accounts (yet), so there's no profile link.
 */
export function HostCard({ event }: { event: AygoEvent }) {
  const host = event.host;
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
        Hosted by
      </p>

      <div className="flex items-center gap-3">
        <Avatar size="lg">
          {host.avatar && <AvatarImage src={host.avatar} alt={host.name} />}
          <AvatarFallback>{initials(host.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold text-foreground">
            {host.name}
          </p>
          <p className="truncate text-[11.5px] text-muted-foreground">
            Organizer
          </p>
        </div>
      </div>
    </div>
  );
}
