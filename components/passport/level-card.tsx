import { LuTicket } from "react-icons/lu";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { levelFor } from "@/hooks/use-registrations";

/** Current explorer level + progress to the next, from a stamp count. */
export function LevelCard({ count }: { count: number }) {
  const { current, next, progress } = levelFor(count);
  const left = next ? next.min - count : 0;
  return (
    <Card className="gap-0 bg-gradient-to-br from-amber-50 to-orange-50 p-5 ring-amber-200/60 [--card-spacing:0px]">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10.5px] font-semibold uppercase tracking-wider text-amber-600">
            Level {current.index}
          </p>
          <p className="text-[22px] font-semibold tracking-tight text-foreground">
            {current.name}
          </p>
        </div>
        <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white text-amber-500 shadow-sm ring-1 ring-amber-200/60">
          <LuTicket className="size-7" />
        </div>
      </div>
      <Progress value={Math.round(progress * 100)} className="mt-4" />
      <p className="mt-2 text-[12px] text-muted-foreground">
        {next
          ? `${left} stamp${left === 1 ? "" : "s"} to ${next.name}`
          : "You've reached the top level!"}
      </p>
    </Card>
  );
}
