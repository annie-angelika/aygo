import { CATEGORY_META } from "@/lib/events-data";
import { cn } from "@/lib/utils";
import type { Stamp } from "@/types";

function StampBadge({ stamp }: { stamp: Stamp }) {
  const { Icon, soft, accent } = CATEGORY_META[stamp.category];
  return (
    <div
      className={cn(
        "flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl p-1.5 text-center ring-1 ring-border",
        soft,
      )}
    >
      <Icon className={cn("size-6", accent)} aria-hidden />
      <span className="line-clamp-2 text-[9.5px] font-semibold leading-tight text-muted-foreground">
        {stamp.title}
      </span>
    </div>
  );
}

/** Collected stamps + dashed empty slots so progress feels tangible. */
export function StampGrid({
  stamps,
  slots = 8,
}: {
  stamps: Stamp[];
  slots?: number;
}) {
  const empties = Math.max(0, slots - stamps.length);
  return (
    <div className="grid grid-cols-4 gap-2.5">
      {stamps.map((s) => (
        <StampBadge key={s.eventId} stamp={s} />
      ))}
      {Array.from({ length: empties }).map((_, i) => (
        <div
          key={i}
          className="aspect-square rounded-2xl border-2 border-dashed border-border"
        />
      ))}
    </div>
  );
}
