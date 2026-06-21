import Link from "next/link";

import { CATEGORY_META } from "@/lib/events-data";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

/** "Browse by category" tile — tinted icon + name + event count. */
export function CategoryCard({
  category,
  count,
}: {
  category: Category;
  count: string;
}) {
  const { Icon, soft, accent } = CATEGORY_META[category];
  return (
    <Link
      href={`/discover/la-paz?interest=${encodeURIComponent(category)}`}
      className="flex items-center gap-3 rounded-2xl bg-card p-3 ring-1 ring-border transition-colors hover:bg-accent/40"
    >
      <span
        className={cn("grid size-10 shrink-0 place-items-center rounded-xl", soft)}
        aria-hidden
      >
        <Icon className={cn("size-5", accent)} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[13.5px] font-semibold text-foreground">
          {category}
        </p>
        <p className="text-[11.5px] text-muted-foreground">{count} events</p>
      </div>
    </Link>
  );
}
