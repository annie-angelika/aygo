"use client";

import { useState } from "react";
import { LuChevronDown } from "react-icons/lu";

import { VisitCard } from "@/components/profile/visit-card";
import { cn } from "@/lib/utils";
import type { Visit } from "@/types";

const PREVIEW = 3;

/** A traveler's route stops, collapsed to a preview with a "View all" toggle. */
export function RouteList({ visits }: { visits: Visit[] }) {
  const [all, setAll] = useState(false);
  const shown = all ? visits : visits.slice(0, PREVIEW);

  return (
    <div className="flex flex-col gap-2.5">
      {shown.map((v) => (
        <VisitCard key={v.id} visit={v} />
      ))}

      {visits.length > PREVIEW && (
        <button
          type="button"
          onClick={() => setAll((a) => !a)}
          className="mt-1 inline-flex items-center justify-center gap-1 self-center rounded-full px-3 py-1.5 text-[12.5px] font-semibold text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
        >
          {all ? "Show less" : `View all ${visits.length} places`}
          <LuChevronDown
            className={cn("size-4 transition-transform", all && "rotate-180")}
            aria-hidden
          />
        </button>
      )}
    </div>
  );
}
