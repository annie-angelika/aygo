"use client";

import Link from "next/link";
import { LuUser, LuStamp, LuSettings, LuLogOut, LuInbox, LuWallet, LuBanknote } from "react-icons/lu";
import { usePollar } from "@pollar/react";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuSeparator,
} from "@/components/ui/menu";
import { useRegistrations } from "@/hooks/use-registrations";
import { useAuth } from "@/hooks/use-auth";
import { useMe } from "@/hooks/use-me";
import { signOutEverywhere } from "@/hooks/use-account-session";
import { cn, initials } from "@/lib/utils";

/** Top-bar avatar that opens the account menu: profile, settings, sign out. */
export function ProfileMenu({
  active,
  dark = false,
}: {
  active: boolean;
  dark?: boolean;
}) {
  const { stamps, hydrated } = useRegistrations();
  const auth = useAuth();
  // The wallet behind in-app payments. Only with a live Pollar login — its
  // windows have nothing to show otherwise.
  const { isAuthenticated: walletReady, openWalletBalanceModal, openRampModal } = usePollar();
  // One identity everywhere (lib/identity): the top-bar photo always matches
  // the profile page.
  const { me, email } = useMe();
  const { name, avatar } = me;
  const subtitle = me.username ? `@${me.username}` : email;
  const count = stamps.length;
  const href = "/profile";

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
            {subtitle && (
              <p className="truncate text-[11.5px] text-muted-foreground">{subtitle}</p>
            )}
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
        {walletReady && (
          <>
            <MenuItem onClick={openWalletBalanceModal}>
              <LuWallet /> Wallet
            </MenuItem>
            <MenuItem onClick={openRampModal}>
              <LuBanknote /> Add or cash out
            </MenuItem>
          </>
        )}

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
