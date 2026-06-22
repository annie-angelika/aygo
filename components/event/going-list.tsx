import Link from "next/link";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FollowButton } from "@/components/profile/follow-button";
import type { TravelerProfile } from "@/types";

const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

/** Travelers going to this event — tap a profile to follow their routes. */
export function GoingList({ people }: { people: TravelerProfile[] }) {
  if (!people.length) return null;
  return (
    <div className="flex flex-col gap-1.5">
      {people.map((p) => (
        <div key={p.username} className="flex items-center gap-3">
          <Link
            href={`/user/${p.username}`}
            className="flex min-w-0 flex-1 items-center gap-3 rounded-xl py-1 transition-colors hover:opacity-80"
          >
            <Avatar className="size-9">
              <AvatarImage src={p.avatar} alt={p.name} />
              <AvatarFallback>{initials(p.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-[13.5px] font-semibold text-foreground">
                {p.name}
              </p>
              <p className="truncate text-[11.5px] text-muted-foreground">
                @{p.username}
              </p>
            </div>
          </Link>
          <FollowButton />
        </div>
      ))}
    </div>
  );
}
