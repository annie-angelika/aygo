"use client";

import { useState } from "react";
import { LuChevronDown } from "react-icons/lu";

import { EventRow } from "@/components/event/event-row";
import { findEvent } from "@/lib/events-data";
import { VISIT_EVENT } from "@/lib/users-data";
import { cn } from "@/lib/utils";
import type { AygoEvent, Visit } from "@/types";

const PREVIEW = 3;

/** A traveler's past events, collapsed to a preview with a "View all" toggle. */
export function RouteList({ visits }: { visits: Visit[] }) {
  const [all, setAll] = useState(false);

  // Each stop renders as the event it came from, so the row matches the
  // calendar timeline exactly. Stops with no resolvable event are skipped.
  const events = visits
    .map((v) => findEvent(VISIT_EVENT[v.id]))
    .filter((e): e is AygoEvent => e != null);
  const shown = all ? events : events.slice(0, PREVIEW);

  return (
    <div className="flex flex-col gap-2.5">
      {shown.map((e) => (
        <EventRow key={e.id} event={e} />
      ))}

      {events.length > PREVIEW && (
        <button
          type="button"
          onClick={() => setAll((a) => !a)}
          className="mt-1 inline-flex items-center justify-center gap-1 self-center rounded-full px-3 py-1.5 text-[12.5px] font-semibold text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
        >
          {all ? "Show less" : `View all ${events.length} places`}
          <LuChevronDown
            className={cn("size-4 transition-transform", all && "rotate-180")}
            aria-hidden
          />
        </button>
      )}
    </div>
  );
}
