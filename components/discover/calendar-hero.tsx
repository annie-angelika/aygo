import { LuMapPin, LuUsers, LuSparkles } from "react-icons/lu";

import { Badge } from "@/components/ui/badge";
import { ProfileHero } from "@/components/discover/profile-hero";
import type { Calendar } from "@/lib/discover-data";

/** Community-calendar header — a calendar identity on the shared ProfileHero. */
export function CalendarHero({
  calendar,
  following,
  onToggleFollow,
}: {
  calendar: Calendar;
  following: boolean;
  onToggleFollow: () => void;
}) {
  return (
    <ProfileHero
      cover={calendar.cover}
      logo={
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={calendar.logo}
          alt=""
          className="size-[68px] rounded-2xl object-cover shadow-[0_12px_24px_-12px_rgba(15,23,42,0.5)] ring-4 ring-card"
        />
      }
      name={calendar.name}
      badge={
        calendar.featured && (
          <Badge variant="secondary" className="gap-1.5 px-2.5">
            <LuSparkles className="size-3" aria-hidden />
            {calendar.featured}
          </Badge>
        )
      }
      meta={
        <>
          {calendar.location && (
            <span className="inline-flex items-center gap-1.5">
              <LuMapPin className="size-3.5 shrink-0" aria-hidden />
              {calendar.location}
            </span>
          )}
          {calendar.location && calendar.subscribers && (
            <span aria-hidden>·</span>
          )}
          {calendar.subscribers && (
            <span className="inline-flex items-center gap-1.5">
              <LuUsers className="size-3.5 shrink-0" aria-hidden />
              {calendar.subscribers} subscribers
            </span>
          )}
        </>
      }
      blurb={calendar.description}
      following={following}
      onToggleFollow={onToggleFollow}
    />
  );
}
