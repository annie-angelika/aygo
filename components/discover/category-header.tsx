"use client";

import { useState } from "react";
import { LuCalendar, LuUsers } from "react-icons/lu";

import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Stat } from "@/components/ui/stat";
import { CATEGORY_META } from "@/lib/events-data";
import { findCategoryBrowse } from "@/lib/discover-data";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

/**
 * Banner-less interest header (Luma category style): a tinted logo, the name,
 * a stat row, a blurb, and a Subscribe action. Used by the category page.
 */
export function CategoryHeader({ category }: { category: Category }) {
  const { Icon, soft, accent } = CATEGORY_META[category];
  const info = findCategoryBrowse(category);
  const [subscribed, setSubscribed] = useState(false);

  return (
    <div className="flex flex-col gap-3.5">
      {/* Back, title, and logo share one row so the header reads wide, not tall. */}
      <div className="flex items-center gap-3">
        <BackButton className="shrink-0 ring-1 ring-border" />
        <h1 className="min-w-0 flex-1 truncate text-[28px] font-semibold leading-tight tracking-tight text-foreground">
          {category}
        </h1>
        <span
          className={cn(
            "grid size-16 shrink-0 place-items-center rounded-2xl",
            soft,
          )}
          aria-hidden
        >
          <Icon className={cn("size-8", accent)} />
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
        <span className="inline-flex items-center gap-1.5">
          <LuCalendar className="size-4 text-muted-foreground" aria-hidden />
          <Stat inline value={info?.count ?? "—"} label="events" />
        </span>
        <span className="inline-flex items-center gap-1.5">
          <LuUsers className="size-4 text-muted-foreground" aria-hidden />
          <Stat inline value={info?.subscribers ?? "—"} label="subscribers" />
        </span>
      </div>

      <Separator />

      {info?.blurb && (
        <p className="text-[13.5px] leading-relaxed text-foreground/80">
          {info.blurb}
        </p>
      )}

      <Button
        onClick={() => setSubscribed((s) => !s)}
        variant={subscribed ? "outline" : "default"}
        className="h-11 w-full rounded-full text-[14px]"
      >
        {subscribed ? "Subscribed" : "Subscribe"}
      </Button>
    </div>
  );
}
