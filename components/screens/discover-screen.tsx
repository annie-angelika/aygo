import { DiscoverBoard } from "@/components/discover/discover-board";
import { SiteFooter } from "@/components/layout/site-footer";

/** Discover — the app's front door: navy hero + search, interests, what's on, Bolivia, calendars. */
export function DiscoverScreen() {
  return (
    <div className="flex min-h-[calc(100svh-3.5rem)] -mb-16 flex-col">
      <DiscoverBoard />
      <div className="mt-auto">
        <SiteFooter />
      </div>
    </div>
  );
}
