import { CATEGORY_META } from "@/lib/events-data";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

/** Category chip: navy pill, gold icon, the interest's name. Resolved from CATEGORY_META. */
export function CategoryChip({
  category,
  className,
}: {
  category: Category;
  className?: string;
}) {
  const { Icon } = CATEGORY_META[category];
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center gap-1 rounded-full bg-primary pl-1.5 pr-2 text-[11.5px] font-bold text-primary-foreground",
        className,
      )}
    >
      <Icon className="size-3 text-gold" aria-hidden />
      {category}
    </span>
  );
}
