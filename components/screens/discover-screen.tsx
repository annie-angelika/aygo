import { SectionTitle } from "@/components/ui/section-title";
import { CategoryCard } from "@/components/discover/category-card";
import { CalendarCard } from "@/components/discover/calendar-card";
import { CityExplorer } from "@/components/city/city-explorer";
import { SiteFooter } from "@/components/layout/site-footer";
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
        {/* One compact row that scrolls sideways — minimal vertical space, and
            the cards peek off-screen to signal there's more. px-4 lives on the
            row so the right gutter is honored at the end of the scroll. */}
        <div className="no-scrollbar -mx-4 overflow-x-auto py-1.5">
          {/* w-max so the row wraps its content — without it the row only fills
              the viewport and the right px-4 lands inside it, not after the last
              card, so the last card collides with the edge at the scroll end. */}
          <div className="flex w-max gap-2 px-4">
            {CATEGORY_BROWSE.map((c) => (
              <CategoryCard
                key={c.category}
                category={c.category}
                count={c.count}
              />
            ))}
          </div>
        </div>
      </section>

      <section>
        <SectionTitle>Featured calendars</SectionTitle>
        {/* px-4 lives on the inner row so the right gutter survives to the
            end of the scroll (a scroll container drops its own end padding). */}
        <div className="no-scrollbar -mx-4 overflow-x-auto pb-1">
          <div className="flex gap-3 px-4">
            {FEATURED_CALENDARS.map((cal) => (
              <CalendarCard key={cal.id} calendar={cal} />
            ))}
          </div>
        </div>
      </section>

      <section>
        <SectionTitle>Explore local events</SectionTitle>
        <CityExplorer />
      </section>

      <div className="-mx-4">
        <SiteFooter />
      </div>
    </div>
  );
}
