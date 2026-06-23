"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LuUser, LuStamp, LuSettings, LuLogOut } from "react-icons/lu";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuSeparator,
} from "@/components/ui/menu";
import { useProfileEdits } from "@/hooks/use-profile";
import { useRegistrations } from "@/hooks/use-registrations";
import { CURRENT_USER } from "@/lib/events-data";
import { cn } from "@/lib/utils";

/** Top-bar avatar that opens the account menu: profile, settings, sign out. */
export function ProfileMenu({ active }: { active: boolean }) {
  const router = useRouter();
  const { edits } = useProfileEdits();
  const { stamps, hydrated } = useRegistrations();
  const count = stamps.length;

  const name = edits.name ?? CURRENT_USER.name;
  const avatar = edits.avatar ?? CURRENT_USER.avatar;
  const href = `/user/${CURRENT_USER.username}`;

  return (
    <Menu>
      <MenuTrigger
        aria-label="Your account"
        className="relative rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Avatar
          className={cn(
            "size-9 ring-2",
            active ? "ring-amber-400" : "ring-background",
          )}
        >
          <AvatarImage src={avatar} alt="Your profile" />
        </Avatar>
        {hydrated && count > 0 && (
          <span className="absolute -right-0.5 -bottom-0.5 grid size-4 place-items-center rounded-full bg-amber-500 text-[9px] font-bold text-white ring-2 ring-background">
            {count}
          </span>
        )}
      </MenuTrigger>

      <MenuContent>
        <div className="flex items-center gap-2.5 px-2.5 py-2">
          <Avatar className="size-9">
            <AvatarImage src={avatar} alt="" />
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-foreground">
              {name}
            </p>
            <p className="truncate text-[11.5px] text-muted-foreground">
              @{CURRENT_USER.username}
            </p>
          </div>
        </div>

        <MenuSeparator />

        <MenuItem render={<Link href={href} />}>
          <LuUser /> View Profile
        </MenuItem>
        <MenuItem render={<Link href={`${href}/collection`} />}>
          <LuStamp /> Collection
          {hydrated && count > 0 && (
            <span className="ml-auto rounded-full bg-muted px-1.5 text-[10.5px] font-semibold text-foreground">
              {count}
            </span>
          )}
        </MenuItem>
        <MenuItem render={<Link href="/settings" />}>
          <LuSettings /> Settings
        </MenuItem>

        <MenuSeparator />

        <MenuItem
          onClick={() => router.push("/home")}
          className="text-destructive data-highlighted:bg-destructive/10 [&_svg]:text-destructive"
        >
          <LuLogOut /> Sign Out
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}
