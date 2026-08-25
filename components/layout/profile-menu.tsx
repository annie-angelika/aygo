"use client";

import Link from "next/link";
import { LuUser, LuStamp, LuSettings, LuLogOut, LuInbox } from "react-icons/lu";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuSeparator,
} from "@/components/ui/menu";
import { useProfileEdits } from "@/hooks/use-profile";
import { useRegistrations } from "@/hooks/use-registrations";
import { useAuth } from "@/hooks/use-auth";
import { signOutEverywhere } from "@/hooks/use-account-session";
import { CURRENT_USER } from "@/lib/events-data";
import { cn, initials } from "@/lib/utils";

/** Top-bar avatar that opens the account menu: profile, settings, sign out. */
export function ProfileMenu({
  active,
  dark = false,
}: {
  active: boolean;
  dark?: boolean;
}) {
  const { edits } = useProfileEdits();
  const { stamps, hydrated } = useRegistrations();
  const auth = useAuth();
  const count = stamps.length;

  // Same precedence as the profile page (use-traveler): your explicit edits
  // win, then the signed-in social identity, then the neutral placeholder —
  // so the top-bar photo always matches your profile.
  const name = edits.name ?? auth.name ?? CURRENT_USER.name;
  const avatar = edits.avatar ?? auth.avatar ?? CURRENT_USER.avatar;
  const subtitle = auth.email ?? `@${CURRENT_USER.username}`;
  const href = `/user/${CURRENT_USER.username}`;

  // Sign out clears the Pollar login, rotates the server session AND wipes the
  // local caches, so a second account on this device never inherits this one's
  // events, RSVPs or inbox.
  function handleSignOut() {
    void signOutEverywhere(auth.logoutAsync);
  }

  return (
    <Menu>
      <MenuTrigger
        aria-label="Your account"
        className="relative rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Avatar
          className={cn(
            "size-9 ring-2",
            active ? "ring-gold" : dark ? "ring-white/15" : "ring-background",
          )}
        >
          {avatar && <AvatarImage src={avatar} alt="Your profile" />}
          <AvatarFallback
            className={cn(
              "text-[12px] font-semibold",
              dark && "bg-cream text-navy",
            )}
          >
            {initials(name)}
          </AvatarFallback>
        </Avatar>
        {hydrated && count > 0 && (
          <span
            className={cn(
              "absolute -right-0.5 -bottom-0.5 grid size-4 place-items-center rounded-full bg-gold text-[9px] font-bold text-navy ring-2",
              dark ? "ring-navy" : "ring-background",
            )}
          >
            {count}
          </span>
        )}
      </MenuTrigger>

      <MenuContent>
        <div className="flex items-center gap-2.5 px-2.5 py-2">
          <Avatar className="size-9">
            {avatar && <AvatarImage src={avatar} alt="" />}
            <AvatarFallback className="text-[12px] font-semibold">
              {initials(name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-foreground">
              {name}
            </p>
            <p className="truncate text-[11.5px] text-muted-foreground">
              {subtitle}
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
        <MenuItem render={<Link href="/inbox" />}>
          <LuInbox /> Inbox
        </MenuItem>
        <MenuItem render={<Link href="/settings" />}>
          <LuSettings /> Settings
        </MenuItem>

        <MenuSeparator />

        <MenuItem
          onClick={handleSignOut}
          className="text-destructive data-highlighted:bg-destructive/10 [&_svg]:text-destructive"
        >
          <LuLogOut /> Sign Out
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}
