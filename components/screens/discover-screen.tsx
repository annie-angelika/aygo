import { SectionTitle } from "@/components/ui/section-title";
import { InterestRow } from "@/components/discover/interest-row";
import { CalendarRow } from "@/components/discover/calendar-row";
import { CityExplorer } from "@/components/city/city-explorer";
import { ForYouRow } from "@/components/discover/for-you-row";
import { DiscoverEvents } from "@/components/discover/discover-events";
import { WelcomeSheet } from "@/components/onboarding/welcome-sheet";
import { SiteFooter } from "@/components/layout/site-footer";

export function DiscoverScreen() {
  return (
    <div className="flex min-h-[calc(100svh-3.5rem)] -mb-16 flex-col gap-6 px-4 pt-4">
      <header>
        <h1 className="text-[26px] font-semibold tracking-tight text-foreground">
          Discover Events
        </h1>
        <p className="mt-1 text-[13px] leading-snug text-muted-foreground">
          Explore popular events near you, browse by interest, or follow one of
          these community calendars.
        </p>
      </header>

      <ForYouRow />

      <section>
        <SectionTitle>Browse by interest</SectionTitle>
        <InterestRow />
      </section>

      <section>
        <SectionTitle>All events</SectionTitle>
        <DiscoverEvents />
      </section>

      <section>
        <SectionTitle>Featured calendars</SectionTitle>
        <CalendarRow />
      </section>

      <section>
        <SectionTitle>Explore local events</SectionTitle>
        <CityExplorer />
      </section>

      <div className="-mx-4 mt-auto">
        <SiteFooter />
      </div>

      <WelcomeSheet />
    </div>
  );
}
