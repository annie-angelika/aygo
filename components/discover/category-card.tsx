import Link from "next/link";

import { CATEGORY_META, categorySlug } from "@/lib/events-data";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

/** "Browse by interest" tile: a bare colored category logo, name + count. */
export function CategoryCard({
  category,
  count,
}: {
  category: Category;
  count: number;
}) {
  const { Icon, accent } = CATEGORY_META[category];
  return (
    <Link
      href={`/${categorySlug(category)}`}
      className="flex shrink-0 items-center gap-2.5 rounded-xl bg-card px-3.5 py-2.5 ring-1 ring-border transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-14px_rgba(15,23,42,0.4)] hover:ring-foreground/15"
    >
      <Icon className={cn("size-5 shrink-0", accent)} aria-hidden />
      <div>
        <p className="whitespace-nowrap text-[13.5px] font-semibold leading-tight text-foreground">
          {category}
        </p>
        <p className="mt-0.5 whitespace-nowrap text-[11.5px] text-muted-foreground">
          {count} events
        </p>
      </div>
    </Link>
  );
}
