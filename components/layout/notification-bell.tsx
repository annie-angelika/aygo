"use client";

import Link from "next/link";
import { LuBell } from "react-icons/lu";

import { useNotifications } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";

/** Top-bar bell → /inbox, with the unread count as a badge. */
export function NotificationBell({
  active,
  dark = false,
}: {
  active: boolean;
  dark?: boolean;
}) {
  const { unread } = useNotifications();
  return (
    <Link
      href="/inbox"
      aria-label={unread > 0 ? `Inbox, ${unread} unread` : "Inbox"}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative grid size-9 place-items-center rounded-full ring-1 transition-colors",
        active
          ? dark
            ? "bg-cream text-navy ring-transparent"
            : "bg-foreground text-background ring-transparent"
          : dark
            ? "bg-white/10 text-white/70 ring-white/15 hover:text-white"
            : "bg-card text-muted-foreground ring-border hover:text-foreground",
      )}
    >
      <LuBell className="size-[18px]" />
      {unread > 0 && (
        <span
          className={cn(
            "absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[9.5px] font-bold text-navy ring-2",
            dark ? "ring-navy" : "ring-background",
          )}
        >
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}
