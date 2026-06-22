"use client";

import { LuUsers } from "react-icons/lu";

import { useRegistrations } from "@/hooks/use-registrations";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Attendees } from "@/components/event/attendees";
import { GoingList } from "@/components/event/going-list";
import type { AygoEvent, TravelerProfile } from "@/types";

/**
 * The attendees bar. Following is gated: only after you join can you open the
 * group and see who's going. Until then it's a plain count + hint, no list.
 */
export function GroupBar({
  event,
  people,
}: {
  event: AygoEvent;
  people: TravelerProfile[];
}) {
  const { isGoing, hydrated } = useRegistrations();
  const joined = hydrated && isGoing(event.id);

  return (
    <Card className="flex-row items-center justify-between p-4 [--card-spacing:0px]">
      <Attendees event={event} />
      {joined ? (
        <Dialog>
          <DialogTrigger className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-[12px] font-semibold text-background transition-colors hover:bg-foreground/90">
            <LuUsers className="size-3.5" />
            View group
          </DialogTrigger>
          <DialogContent>
            <div>
              <DialogTitle>Who&apos;s going</DialogTitle>
              <DialogDescription>
                {event.attendees} going · follow travelers you like
              </DialogDescription>
            </div>
            <div className="-mr-1 max-h-[60vh] overflow-y-auto pr-1">
              <GoingList people={people} />
            </div>
          </DialogContent>
        </Dialog>
      ) : (
        <span className="text-[12px] text-muted-foreground">
          Join to see the group
        </span>
      )}
    </Card>
  );
}
