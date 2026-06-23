import Link from "next/link";
import { LuStamp, LuChevronRight } from "react-icons/lu";

import { Card } from "@/components/ui/card";

/** Tappable collection summary on the profile — opens the full aygo wall. */
export function PassportCard({
  count,
  href,
}: {
  count: number;
  href: string;
}) {
  return (
    <Link href={href} className="block">
      <Card className="relative overflow-hidden p-4 transition-colors hover:bg-accent/40 [--card-spacing:0px]">
        <LuStamp
          className="pointer-events-none absolute -right-2 -top-2 size-20 rotate-12 text-foreground/[0.04]"
          aria-hidden
        />
        <div className="relative flex items-center gap-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-foreground text-background shadow-sm">
            <LuStamp className="size-6" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[19px] font-semibold leading-tight tracking-tight text-foreground">
              {count} {count === 1 ? "aygo" : "aygos"}
            </p>
            <p className="mt-0.5 text-[11.5px] text-muted-foreground">
              Earned at events you attended
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-muted py-1 pl-3 pr-2 text-[11.5px] font-semibold text-foreground">
            View all
            <LuChevronRight className="size-3.5" aria-hidden />
          </span>
        </div>
      </Card>
    </Link>
  );
}
