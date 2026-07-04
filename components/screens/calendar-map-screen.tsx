import { MapScreen } from "@/components/discover/map-screen";
import { findCalendar } from "@/lib/discover-data";

/** Dedicated map view for a community calendar, at /<calendar>/map. Centers on
 *  the calendar's location and scopes to the calendar's interest. */
export function CalendarMapScreen({ id }: { id: string }) {
  const calendar = findCalendar(id);
  if (!calendar) return null;

  return (
    <MapScreen
      title={calendar.name}
      city={calendar.location ?? "La Paz"}
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
