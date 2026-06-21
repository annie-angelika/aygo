"use client";

import { LuCheck } from "react-icons/lu";

import { useRegistrations } from "@/hooks/use-registrations";
import { Button } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";
import type { AygoEvent } from "@/types";

/**
 * The single primary action on the detail screen. Before RSVP it's "I'm going";
 * once you're going it becomes the WhatsApp coordination handoff (the contact
 * mechanism) plus a check-in that earns a passport stamp. Smallest client island.
 */
export function EventActions({ event }: { event: AygoEvent }) {
  const { isGoing, toggleGoing, addStamp, hydrated } = useRegistrations();
  const going = hydrated && isGoing(event.id);
  const waText = `Hi ${event.host.name}! Confirming I'll be at "${event.title}".`;

  if (going) {
    return (
      <div className="flex flex-col items-center gap-2">
        <p className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-emerald-700">
          <LuCheck className="size-4" /> You&apos;re going to this event!
        </p>
        <WhatsAppButton
          phone={event.host.phone}
          text={waText}
          size="md"
          label="Coordinate on WhatsApp"
          className="h-12 w-full text-[14px]"
        />
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => addStamp(event)}
            className="text-[12px] font-semibold text-foreground"
          >
            Mark as attended
          </button>
          <button
            type="button"
            onClick={() => toggleGoing(event.id)}
            className="text-[12px] font-medium text-muted-foreground"
          >
            Cancel my spot
          </button>
        </div>
      </div>
    );
  }

  return (
    <Button
      size="lg"
      onClick={() => toggleGoing(event.id)}
      className="h-12 w-full rounded-full text-[14px]"
    >
      I&apos;m going
    </Button>
  );
}
