import Link from "next/link";
import type { IconType } from "react-icons";
import {
  LuUserPlus,
  LuUserCheck,
  LuCheck,
  LuX,
  LuCalendarX,
  LuMessageCircle,
  LuReply,
  LuFlag,
} from "react-icons/lu";

import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/time-ago";
import type { AppNotification, NotificationKind } from "@/types";

// One palette: navy-soft for anything that happened, gold for the one good
// news that confirms a spot, muted for closed/negative outcomes.
const META: Record<NotificationKind, { Icon: IconType; tint: string }> = {
  registration: { Icon: LuUserPlus, tint: "bg-secondary text-foreground" },
  request: { Icon: LuUserCheck, tint: "bg-secondary text-foreground" },
  approved: { Icon: LuCheck, tint: "bg-gold text-navy" },
  rejected: { Icon: LuX, tint: "bg-muted text-muted-foreground" },
  removed: { Icon: LuX, tint: "bg-muted text-muted-foreground" },
  cancelled: { Icon: LuCalendarX, tint: "bg-muted text-muted-foreground" },
  question: { Icon: LuMessageCircle, tint: "bg-secondary text-foreground" },
  reply: { Icon: LuReply, tint: "bg-secondary text-foreground" },
  report_update: { Icon: LuFlag, tint: "bg-muted text-muted-foreground" },
};

/** One notification: icon by kind, title/body, relative time, tap → target. */
export function NotificationRow({ item }: { item: AppNotification }) {
  const { Icon, tint } = META[item.kind] ?? META.reply;
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-start gap-3 px-3.5 py-3 transition-colors hover:bg-accent/40",
        !item.read && "bg-gold-soft/60",
      )}
    >
      <span className={cn("mt-0.5 grid size-9 shrink-0 place-items-center rounded-full", tint)}>
        <Icon className="size-4" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13.5px] font-semibold text-foreground">
          {item.title}
        </span>
        <span className="mt-0.5 line-clamp-2 block text-[12.5px] leading-snug text-muted-foreground">
          {item.body}
        </span>
      </span>
      <span className="shrink-0 pt-0.5 text-[11px] text-muted-foreground">
        {timeAgo(item.createdAt)}
      </span>
    </Link>
  );
}
