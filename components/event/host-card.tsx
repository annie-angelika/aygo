import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";
import type { AygoEvent } from "@/types";

/** Host row with a WhatsApp shortcut — the contact mechanism for now. */
export function HostCard({ event }: { event: AygoEvent }) {
  const text = `Hi ${event.host.name}! I saw "${event.title}" on aygo and I'd like to join.`;
  return (
    <div className="flex items-center gap-3">
      <Avatar size="lg">
        <AvatarImage src={event.host.avatar} alt={event.host.name} />
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
          Host
        </p>
        <p className="truncate text-[14px] font-semibold text-foreground">
          {event.host.name}
        </p>
      </div>
      <WhatsAppButton
        phone={event.host.phone}
        text={text}
        size="md"
        label="Message"
      />
    </div>
  );
}
