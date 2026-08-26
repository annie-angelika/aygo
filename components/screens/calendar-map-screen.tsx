import { MapScreen } from "@/components/discover/map-screen";
import { HOME_CITY } from "@/lib/cities-seed";
import type { CalendarInfo } from "@/types";

/** Dedicated map view for a community calendar, at /<calendar>/map. Centers on
 *  the calendar's location (the home market when it has none) and scopes to
 *  the calendar's interest. The row is resolved server-side (see /[slug]/map). */
export function CalendarMapScreen({ calendar }: { calendar: CalendarInfo }) {
  return (
    <MapScreen
      title={calendar.name}
      city={calendar.location ?? HOME_CITY}
      category={calendar.category}
      logo={
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={calendar.logo}
          alt=""
          className="size-9 shrink-0 rounded-lg object-cover ring-1 ring-border"
        />
      }
    />
  );
}
