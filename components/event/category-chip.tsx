import { Badge } from "@/components/ui/badge";
import { CATEGORY_META } from "@/lib/events-data";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

/** Category badge with its react-icon + color, resolved from CATEGORY_META. */
export function CategoryChip({
  category,
  className,
}: {
  category: Category;
  className?: string;
}) {
  const { Icon, chip } = CATEGORY_META[category];
  return (
    <Badge className={cn("gap-1 border-transparent", chip, className)}>
      <Icon className="size-3" />
      {category}
    </Badge>
  );
}
