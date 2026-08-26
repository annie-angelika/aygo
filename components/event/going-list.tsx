import Link from "next/link";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";
import type { Attendee } from "@/types";

/**
 * The real guest list: people who actually RSVPed — name + avatar when they
 * saved a profile, "Guest" otherwise. A goer with a username links to their
 * public profile.
 */
export function GoingList({ people }: { people: Attendee[] }) {
  if (!people.length) return null;
  return (
    <div className="flex flex-col">
      {people.map((p, i) => {
        const row = (
          <>
            <Avatar className="size-9">
              {p.avatar && <AvatarImage src={p.avatar} alt={p.name} />}
              <AvatarFallback>{initials(p.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-semibold text-foreground">{p.name}</p>
              {p.username && (
                <p className="truncate text-[11.5px] text-muted-foreground">@{p.username}</p>
              )}
            </div>
          </>
        );
        const className =
          "flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-muted/50";
        return p.username ? (
          <Link key={`${p.username}-${i}`} href={`/u/${p.username}`} className={className}>
            {row}
          </Link>
        ) : (
          <div key={`${p.name}-${i}`} className={className}>
            {row}
          </div>
        );
      })}
    </div>
  );
}
