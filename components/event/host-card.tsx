import Link from "next/link";
import { LuBadgeCheck, LuCalendarCheck } from "react-icons/lu";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { hostsFor } from "@/lib/hosts";
import type { AygoEvent } from "@/types";

const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

/**
 * The host team. One organizer, optionally a few co-hosts — contact happens
 * in-app now (no WhatsApp handoff), so this is identity + reputation only.
 */
export function HostCard({ event }: { event: AygoEvent }) {
  const { hosts, eventsHosted } = hostsFor(event);
  const many = hosts.length > 1;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
          {many ? `Hosted by ${hosts.length}` : "Hosted by"}
        </p>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
          <LuCalendarCheck className="size-3.5 text-amber-500" aria-hidden />
          {eventsHosted} events hosted
        </span>
      </div>

      <ul className="-mx-2 flex flex-col">
        {hosts.map((h) => (
          <li key={h.username}>
            <Link
              href={`/user/${h.username}`}
              className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-muted/50"
            >
              <Avatar size={many ? "default" : "lg"}>
                <AvatarImage src={h.avatar} alt={h.name} />
                <AvatarFallback>{initials(h.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1 truncate text-[14px] font-semibold text-foreground">
                  {h.name}
                  {h.verified && (
                    <LuBadgeCheck
                      className="size-4 shrink-0 text-amber-500"
                      aria-label="Verified host"
                    />
                  )}
                </p>
                <p className="truncate text-[11.5px] text-muted-foreground">
                  {h.role}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
