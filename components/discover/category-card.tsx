import Link from "next/link";

import { CATEGORY_META, categorySlug } from "@/lib/events-data";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

/**
 * "Browse by interest" tile: a navy-soft square with the interest's icon and
 * its name underneath. `active` flips it to navy with a gold icon. One colour
 * for every interest — the icon + label do the telling.
 */
export function CategoryCard({
  category,
  count,
  active = false,
}: {
  category: Category;
  count?: number;
  active?: boolean;
}) {
  const { Icon } = CATEGORY_META[category];
  return (
    <Link
      href={`/${categorySlug(category)}`}
      className="group flex w-16 shrink-0 flex-col items-center gap-1.5 lg:w-24"
      aria-label={count != null ? `${category}, ${count} events` : category}
    >
      <span
        className={cn(
          "grid size-14 place-items-center rounded-[18px] transition-all group-hover:-translate-y-0.5 lg:size-[72px] lg:rounded-[22px]",
          active
            ? "bg-primary text-gold shadow-[0_10px_20px_-12px_rgba(9,25,53,0.6)]"
            : "bg-secondary text-foreground group-hover:bg-navy-soft/70",
        )}
      >
        <Icon className="size-[26px] lg:size-8" aria-hidden />
      </span>
      <span className="text-[11.5px] font-semibold text-foreground lg:text-[13px]">{category}</span>
    </Link>
  );
}
