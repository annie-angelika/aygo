import { LuMapPin } from "react-icons/lu";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Stat } from "@/components/ui/stat";

/** Identity block for a tourism profile: cover, avatar, bio, stats, actions. */
export function ProfileHeader({
  name,
  handle,
  avatar,
  bio,
  location,
  followers,
  following,
  visited,
  action,
}: {
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  location: string;
  followers: number;
  following: number;
  visited: number;
  action?: React.ReactNode;
}) {
  return (
    <div>
      <div className="relative">
        <div className="h-24 rounded-3xl bg-gradient-to-br from-amber-200 via-orange-100 to-rose-100 ring-1 ring-border" />
        <Avatar className="absolute -bottom-7 left-4 size-20 ring-4 ring-background">
          <AvatarImage src={avatar} alt={name} />
        </Avatar>
      </div>

      <div className="mt-9 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-[20px] font-semibold tracking-tight text-foreground">
            {name}
          </h1>
          <p className="text-[12.5px] text-muted-foreground">@{handle}</p>
        </div>
        {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
      </div>

      <p className="mt-2 text-[13px] leading-snug text-foreground/80">{bio}</p>
      <p className="mt-1.5 inline-flex items-center gap-1 text-[12px] text-muted-foreground">
        <LuMapPin className="size-3.5" aria-hidden />
        {location}
      </p>

      <div className="mt-4 flex items-center gap-7">
        <Stat value={followers} label="Followers" />
        <Stat value={following} label="Following" />
        <Stat value={visited} label="Visited" />
      </div>
    </div>
  );
}
