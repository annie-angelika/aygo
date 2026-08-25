import { LuLock, LuCheck } from "react-icons/lu";

import { AygoStamp } from "@/components/passport/aygo-stamp";
import { cn } from "@/lib/utils";
import type { Stamp } from "@/types";

/** One stamp in a wall — the square tile plus its title; tappable when `onSelect` is set. */
export function StampBadge({
  stamp,
  dateLabel,
  onSelect,
  featured,
  showToggle,
}: {
  stamp: Stamp;
  dateLabel?: string;
  onSelect?: (stamp: Stamp) => void;
  featured?: boolean;
  showToggle?: boolean;
}) {
  const tile = (
    <span
      className={cn(
        "relative block w-full transition-transform duration-200",
        onSelect && "hover:-translate-y-0.5",
      )}
    >
      <AygoStamp stamp={stamp} dateLabel={dateLabel} />
      {showToggle && (
        <span
          className={cn(
            "absolute -left-1 -top-1 grid size-5 place-items-center rounded-full ring-2 ring-background transition-colors",
            featured
              ? "bg-gold text-navy"
              : "border border-dashed border-border bg-card text-transparent",
          )}
        >
          <LuCheck className="size-3" strokeWidth={2.5} aria-hidden />
        </span>
      )}
    </span>
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
          {tile}
        </button>
      ) : (
        tile
      )}
      <span className="line-clamp-2 text-center text-[11.5px] font-semibold leading-tight text-foreground">
        {stamp.title}
      </span>
    </div>
  );
}

/** A slot still to be earned — a dashed square where a stamp will go. */
function EmptySlot() {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="grid aspect-square w-full place-items-center rounded-md border-2 border-dashed border-border text-muted-foreground/30">
        <LuLock className="size-4" aria-hidden />
      </div>
      {/* Spacer keeps locked slots the same height as collected ones. */}
      <span className="text-[11.5px] leading-tight">&nbsp;</span>
    </div>
  );
}

/** Grid of collected stamps + dashed locked slots so progress feels tangible. */
export function StampGrid({
  stamps,
  slots = 6,
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
    <div className="grid grid-cols-3 gap-x-3 gap-y-4 sm:grid-cols-4 lg:grid-cols-6">
      {stamps.map((s) => (
        <StampBadge
          key={s.eventId}
          stamp={s}
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
