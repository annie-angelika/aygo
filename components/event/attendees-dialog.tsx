"use client";

import type { ReactNode } from "react";
import { LuLock } from "react-icons/lu";

import { AvatarStack } from "@/components/ui/avatar-stack";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { GoingList } from "@/components/event/going-list";
import type { AygoEvent, Attendee } from "@/types";

/**
 * The "who's going" roster modal + its trigger. The trigger's look is supplied
 * by the caller (`triggerClassName` + `children`). The guest list itself is
 * gated: only travelers who've joined see the names — everyone else gets a
 * teaser and a nudge to join. `people` are real RSVPs, never invented.
 */
export function AttendeesDialog({
  event,
  people,
  joined,
  total,
  triggerClassName,
  children,
}: {
  event: AygoEvent;
  people: Attendee[];
  joined: boolean;
  /** Display total (may include your own not-yet-synced RSVP). */
  total: number;
  triggerClassName?: string;
  children: ReactNode;
}) {
  return (
    <Dialog>
      <DialogTrigger className={triggerClassName}>{children}</DialogTrigger>

      <DialogContent className="gap-0 p-0">
        {joined ? (
          <>
            <div className="flex items-center gap-3 border-b border-border p-5">
              <AvatarStack
                srcs={people
                  .map((p) => p.avatar)
                  .filter((a): a is string => Boolean(a))}
                total={total}
                max={4}
                size="default"
              />
              <div className="min-w-0">
                <DialogTitle>Who&apos;s going</DialogTitle>
                <DialogDescription>
                  {total} going to {event.title}
                </DialogDescription>
              </div>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-3">
              <GoingList people={people} />
            </div>
          </>
        ) : (
          <GuestGate />
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Locked state: a faded teaser of rows, then the nudge to join. */
function GuestGate() {
  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="relative">
        <div className="flex flex-col gap-3 opacity-50" aria-hidden>
          {[0, 1].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="size-10 shrink-0 rounded-full bg-muted" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="h-3 w-2/3 rounded-full bg-muted" />
                <div className="h-3 w-2/5 rounded-full bg-muted/70" />
              </div>
            </div>
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-b from-transparent to-card" />
      </div>

      <span className="grid size-11 place-items-center rounded-full bg-muted text-muted-foreground">
        <LuLock className="size-5" aria-hidden />
      </span>
      <div>
        <DialogTitle>Join to see the guest list</DialogTitle>
        <DialogDescription className="mt-1 leading-snug">
          The full guest list is only for travelers going to this event.
        </DialogDescription>
      </div>

      <DialogClose
        render={<Button className="h-11 w-full rounded-xl text-[13.5px]">Got it</Button>}
      />
    </div>
  );
}

/** "Mara, Diego and 3 more" — a friendly preview of who's really in. */
export function namePreview(people: Attendee[], total: number) {
  const names = people.slice(0, 2).map((p) => p.name.split(" ")[0]);
  if (names.length === 0) return `${total} going`;
  const rest = total - names.length;
  if (rest <= 0) return names.join(", ");
  return `${names.join(", ")} and ${rest} more`;
}
