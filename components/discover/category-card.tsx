import Link from "next/link";

import { CATEGORY_META } from "@/lib/events-data";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

/** Image-backed "browse by interest" tile: photo, icon chip, name + count. */
export function CategoryCard({
  category,
  count,
  image,
}: {
  category: Category;
  count: string;
  image: string;
}) {
  const { Icon, accent } = CATEGORY_META[category];
  return (
    <Link
      href={`/discover/la-paz?interest=${encodeURIComponent(category)}`}
      className="group relative block aspect-[5/4] overflow-hidden rounded-2xl ring-1 ring-border"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt=""
        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
      <span
        className={cn(
          "absolute left-2.5 top-2.5 grid size-7 place-items-center rounded-lg bg-white/95 backdrop-blur",
          accent,
        )}
        aria-hidden
      >
        <Icon className="size-4" />
      </span>
      <div className="absolute inset-x-3 bottom-2.5">
        <p className="text-[14.5px] font-semibold text-white">{category}</p>
        <p className="text-[11.5px] text-white/80">{count} events</p>
      </div>
    </Link>
  );
}
