"use client";

import { LuUsers, LuLock, LuChevronRight } from "react-icons/lu";

import { useRegistrations } from "@/hooks/use-registrations";
import { Card } from "@/components/ui/card";
import { AvatarStack } from "@/components/ui/avatar-stack";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { GoingList } from "@/components/event/going-list";
import type { AygoEvent, TravelerProfile } from "@/types";

/** "Mara, Diego y 3 más" — a friendly preview of who's in. */
function namePreview(people: TravelerProfile[], total: number) {
  const names = people.slice(0, 2).map((p) => p.name.split(" ")[0]);
  const rest = total - names.length;
  if (rest <= 0) return names.join(", ");
  return `${names.join(", ")} and ${rest} more`;
}

/**
 * The attendees bar. Following is gated: only after you join can you open the
 * group and see who's going. Until then it's a preview of faces + a count, no list.
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
    <Card className="gap-3 p-4 [--card-spacing:0px]">
      <div className="flex items-center justify-between gap-3">
        <AvatarStack
          srcs={people.map((p) => p.avatar)}
          total={event.attendees}
          max={5}
          size="default"
        />
        <p className="text-[10.5px] font-semibold uppercase tracking-wider text-amber-600">
          {event.attendees} going
        </p>
      </div>

      <p className="text-[12.5px] leading-snug text-foreground/80">
        {namePreview(people, event.attendees)} are going.
      </p>

      {joined ? (
        <Dialog>
          <DialogTrigger className="flex items-center justify-between rounded-xl bg-muted/60 px-3.5 py-2.5 text-[12.5px] font-semibold text-foreground transition-colors hover:bg-muted">
            <span className="inline-flex items-center gap-1.5">
              <LuUsers className="size-4" />
              View the group
            </span>
            <LuChevronRight className="size-4 text-muted-foreground" />
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
        <div className="flex items-center gap-2 rounded-xl bg-muted/40 px-3.5 py-2.5 text-[12px] text-muted-foreground">
          <LuLock className="size-3.5 shrink-0" aria-hidden />
          Join to see who&apos;s going and follow them.
        </div>
      )}
    </Card>
  );
}
