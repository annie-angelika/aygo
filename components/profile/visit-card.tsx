import Link from "next/link";

import { Stars } from "@/components/ui/stars";
import { CategoryChip } from "@/components/event/category-chip";
import { HeartButton } from "@/components/profile/heart-button";
import { VISIT_EVENT } from "@/lib/users-data";
import type { Visit } from "@/types";

/** Luma-style past-event row — taps through to the event it came from. */
export function VisitCard({ visit }: { visit: Visit }) {
  const eventId = VISIT_EVENT[visit.id];

  const body = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={visit.cover}
        alt=""
        className="size-[76px] shrink-0 rounded-xl object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="text-[11.5px] font-medium text-muted-foreground">
          {visit.city} · {visit.date}
        </p>
        <p className="mt-0.5 truncate text-[14.5px] font-semibold text-foreground">
          {visit.place}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
          <Stars value={visit.rating} />
          <CategoryChip category={visit.category} />
        </div>
      </div>
    </>
  );

  return (
    <div className="flex items-center gap-3.5 rounded-2xl bg-card p-3 ring-1 ring-border transition-colors hover:bg-accent/40">
      {eventId ? (
        <Link
          href={`/event/${eventId}`}
          className="flex min-w-0 flex-1 items-center gap-3.5"
        >
          {body}
        </Link>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-3.5">{body}</div>
      )}
      <HeartButton count={visit.likes} />
    </div>
  );
}
