import { Stars } from "@/components/ui/stars";
import { CATEGORY_META } from "@/lib/events-data";
import { cn } from "@/lib/utils";
import type { Visit } from "@/types";

/** A visited, rated place in the tourism feed: thumbnail, place, rating. */
export function VisitCard({ visit }: { visit: Visit }) {
  const { Icon, accent } = CATEGORY_META[visit.category];
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-card p-2.5 ring-1 ring-border">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={visit.cover}
        alt=""
        className="size-14 shrink-0 rounded-xl object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-semibold text-foreground">
          {visit.place}
        </p>
        <p className="truncate text-[12px] text-muted-foreground">
          {visit.city} · {visit.date}
        </p>
        <Stars value={visit.rating} className="mt-1" />
      </div>
      <Icon className={cn("size-4 shrink-0", accent)} aria-hidden />
    </div>
  );
}
