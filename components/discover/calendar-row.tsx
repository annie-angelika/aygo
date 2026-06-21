import Link from "next/link";
import { LuMapPin, LuChevronRight } from "react-icons/lu";

import type { Calendar } from "@/lib/discover-data";

/** Featured calendar row — logo, name, optional place, and a short blurb. */
export function CalendarRow({ calendar }: { calendar: Calendar }) {
  return (
    <Link
      href="/discover/la-paz"
      className="flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-accent/40"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={calendar.logo}
        alt=""
        className="size-12 shrink-0 rounded-xl object-cover ring-1 ring-border"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold text-foreground">
          {calendar.name}
        </p>
        {calendar.location && (
          <p className="inline-flex items-center gap-1 text-[11.5px] text-muted-foreground">
            <LuMapPin className="size-3" aria-hidden />
            {calendar.location}
          </p>
        )}
        <p className="line-clamp-2 text-[12px] leading-snug text-muted-foreground">
          {calendar.description}
        </p>
      </div>
      <LuChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
    </Link>
  );
}
