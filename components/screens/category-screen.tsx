import { CategoryHeader } from "@/components/discover/category-header";
import { EventsBoard } from "@/components/discover/events-board";
import type { Category } from "@/types";

/** Banner-less interest page: header (with inline back) + events board. */
export function CategoryScreen({ category }: { category: Category }) {
  return (
    <div className="flex flex-col gap-5 px-4 pt-3 lg:gap-8 lg:pt-4">
      <CategoryHeader category={category} />
      <EventsBoard category={category} upcomingOnly />
    </div>
  );
}
