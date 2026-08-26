import { LuMapPin } from "react-icons/lu";

import { AygoStar } from "@/components/ui/brand-icons";
import { ProfileHero } from "@/components/discover/profile-hero";
import type { Calendar } from "@/lib/discover-data";

/** Community-calendar header — a calendar identity on the shared ProfileHero. */
export function CalendarHero({ calendar }: { calendar: Calendar }) {
  return (
    <ProfileHero
      logo={
        // eslint-disable-next-line @next/next/no-img-element
        <img src={calendar.logo} alt="" className="size-full object-cover" />
      }
      name={calendar.name}
      badge={
        calendar.featured && (
          <span className="inline-flex h-6 items-center gap-1.5 rounded-full bg-white/10 px-2.5 text-[11px] font-semibold text-cream ring-1 ring-white/15">
            <AygoStar className="size-3 text-gold" />
            {calendar.featured}
          </span>
        )
      }
      meta={
        calendar.location && (
          <span className="inline-flex items-center gap-1.5">
            <LuMapPin className="size-3.5 shrink-0" aria-hidden />
            {calendar.location}
          </span>
        )
      }
      blurb={calendar.description}
      mapHref={`/${calendar.id}/map`}
    />
  );
}
