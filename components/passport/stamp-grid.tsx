import { LuLock, LuCheck } from "react-icons/lu";

import { CATEGORY_META } from "@/lib/events-data";
import { cn } from "@/lib/utils";
import type { Stamp } from "@/types";

// A little rotation per stamp so the grid reads like an inked passport page;
// hovering straightens the stamp back out.
const TILTS = ["-rotate-6", "rotate-3", "-rotate-3", "rotate-6"];

function StampBadge({
  stamp,
  tilt,
  onSelect,
  featured,
  showToggle,
}: {
  stamp: Stamp;
  tilt: string;
  onSelect?: (stamp: Stamp) => void;
  featured?: boolean;
  showToggle?: boolean;
}) {
  const { Icon, soft, accent } = CATEGORY_META[stamp.category];

  const disc = (
    <div
      className={cn(
        "relative grid aspect-square w-full place-items-center rounded-full shadow-sm ring-1 ring-current/15 transition-transform duration-200",
        soft,
        accent,
        tilt,
        onSelect && "cursor-pointer hover:rotate-0",
      )}
    >
      <Icon className="size-7" aria-hidden />
      {showToggle && (
        <span
          className={cn(
            "absolute -right-1 -top-1 grid size-5 place-items-center rounded-full ring-2 ring-background transition-colors",
            featured
              ? "bg-amber-500 text-white"
              : "border border-dashed border-border bg-card text-transparent",
          )}
        >
          <LuCheck className="size-3" aria-hidden />
        </span>
      )}
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-2">
      {onSelect ? (
        <button
          type="button"
          onClick={() => onSelect(stamp)}
          aria-label={stamp.title}
          className="w-full"
        >
          {disc}
        </button>
      ) : (
        disc
      )}
      <span className="line-clamp-2 text-center text-[10px] font-semibold leading-tight text-foreground">
        {stamp.title}
      </span>
    </div>
  );
}

function EmptySlot() {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="grid aspect-square w-full place-items-center rounded-full border-2 border-dashed border-border text-muted-foreground/30">
        <LuLock className="size-4" aria-hidden />
      </div>
      {/* Spacer keeps locked slots the same height as collected ones. */}
      <span className="text-[10px] leading-tight">&nbsp;</span>
    </div>
  );
}

/** Grid of collected stamps + dashed locked slots so progress feels tangible. */
export function StampGrid({
  stamps,
  slots = 8,
  onSelect,
  featuredIds,
  showToggle,
}: {
  stamps: Stamp[];
  slots?: number;
  onSelect?: (stamp: Stamp) => void;
  featuredIds?: string[];
  showToggle?: boolean;
}) {
  const empties = Math.max(0, slots - stamps.length);
  return (
    <div className="grid grid-cols-4 gap-x-3 gap-y-4">
      {stamps.map((s, i) => (
        <StampBadge
          key={s.eventId}
          stamp={s}
          tilt={TILTS[i % TILTS.length]}
          onSelect={onSelect}
          featured={featuredIds?.includes(s.eventId)}
          showToggle={showToggle}
        />
      ))}
      {Array.from({ length: empties }).map((_, i) => (
        <EmptySlot key={i} />
      ))}
    </div>
  );
}
