import { SectionTitle } from "@/components/ui/section-title";
import { CategoryCard } from "@/components/discover/category-card";
import { CalendarCard } from "@/components/discover/calendar-card";
import { CityExplorer } from "@/components/city/city-explorer";
import { CATEGORY_BROWSE, FEATURED_CALENDARS } from "@/lib/discover-data";

export function DiscoverScreen() {
  return (
    <div className="flex flex-col gap-6 px-4 pt-4">
      <header>
        <h1 className="text-[26px] font-semibold tracking-tight text-foreground">
          Discover Events
        </h1>
        <p className="mt-1 text-[13px] leading-snug text-muted-foreground">
          Explore popular events near you, browse by interest, or follow one of
          these community calendars.
        </p>
      </header>

      <section>
        <SectionTitle>Browse by interest</SectionTitle>
        <div className="grid grid-cols-2 gap-2.5">
          {CATEGORY_BROWSE.map((c) => (
            <CategoryCard
              key={c.category}
              category={c.category}
              count={c.count}
              image={c.image}
            />
          ))}
        </div>
      </section>

      <section>
        <SectionTitle>Featured calendars</SectionTitle>
        <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
          {FEATURED_CALENDARS.map((cal) => (
            <CalendarCard key={cal.id} calendar={cal} />
          ))}
        </div>
      </section>

      <section>
        <SectionTitle>Explore local events</SectionTitle>
        <CityExplorer />
      </section>
    </div>
  );
}
