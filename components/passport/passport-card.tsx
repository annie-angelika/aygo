import Link from "next/link";
import { LuStamp, LuChevronRight } from "react-icons/lu";

import { Card } from "@/components/ui/card";

/** Tappable passport summary — opens the full rewards screen. */
export function PassportCard({
  count,
  href,
}: {
  count: number;
  href: string;
}) {
  return (
    <Link href={href} className="block">
      <Card className="p-4 transition-colors hover:bg-accent/40 [--card-spacing:0px]">
        <div className="flex items-center gap-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-amber-100 text-amber-600">
            <LuStamp className="size-6" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
              Passport
            </p>
            <p className="mt-0.5 text-[18px] font-semibold leading-tight tracking-tight text-foreground">
              {count} {count === 1 ? "stamp" : "stamps"}
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-0.5 text-[12.5px] font-medium text-muted-foreground">
            View all
            <LuChevronRight className="size-4" aria-hidden />
          </span>
        </div>
      </Card>
    </Link>
  );
}
