"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LuTicket, LuCompass, LuPlus, LuLoaderCircle, LuRefreshCw } from "react-icons/lu";

import { Logo } from "@/components/layout/logo";
import { NotificationBell } from "@/components/layout/notification-bell";
import { ProfileMenu } from "@/components/layout/profile-menu";
import { SignInButton } from "@/components/auth/sign-in-button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

/**
 * The top app bar — the whole navigation, in the brand's navy with the cream
 * mark. The logo and the compass open Discover (the app's front door, signed
 * in or not), the ticket opens your events (Home), and the avatar opens your
 * profile (with a small aygo-count badge).
 * `tone="light"` is kept for the rare light canvas (e.g. a light create theme).
 */
export function TopBar({ tone = "dark" }: { tone?: "light" | "dark" }) {
  // `usePathname` can be null while rendering the global not-found page.
  const pathname = usePathname() ?? "";
  const { isAuthenticated, linking, linkError, retryLink } = useAuth();
  // Full-screen detail views (e.g. the collection) own their own back button.
  if (pathname.endsWith("/collection")) return null;
  const dark = tone === "dark";
  const onHome = pathname.startsWith("/home");
  const onDiscover = pathname.startsWith("/discover");
  const onProfile = pathname.startsWith("/profile") || pathname.startsWith("/u/") || pathname.startsWith("/settings");
  const onCreate = pathname.startsWith("/create");

  return (
    <header
      className={cn(
        "sticky top-0 z-40",
        dark ? "bg-navy" : "border-b border-border/70 bg-background/80 backdrop-blur-xl",
      )}
    >
      <div className="mx-auto flex h-14 max-w-md items-center justify-between px-4 lg:h-16 lg:max-w-6xl lg:px-8">
        <Link href="/discover" aria-label="aygo, Discover">
          <Logo tone={dark ? "dark" : "light"} />
        </Link>

        <nav className="flex items-center gap-2">
          <NavIcon href="/discover" label="Discover" active={onDiscover} dark={dark}>
            <LuCompass className="size-[18px]" />
          </NavIcon>

          {isAuthenticated ? (
            <>
              <Link
                href="/create"
                aria-label="Create event"
                aria-current={onCreate ? "page" : undefined}
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold ring-1 transition-colors",
                  onCreate
                    ? dark
                      ? "bg-cream text-navy ring-transparent"
                      : "bg-foreground text-background ring-transparent"
                    : dark
                      ? "bg-white/10 text-cream ring-white/15 hover:bg-white/15"
                      : "bg-card text-foreground ring-border hover:bg-muted",
                )}
              >
                <LuPlus className="size-[18px]" aria-hidden />
                <span>Create</span>
              </Link>

              <NavIcon href="/home" label="Tickets" active={onHome} dark={dark}>
                <LuTicket className="size-[18px]" />
              </NavIcon>

              <NotificationBell active={pathname.startsWith("/inbox")} dark={dark} />

              <ProfileMenu active={onProfile} dark={dark} />
            </>
          ) : linking ? (
            // The Pollar login is being proven to the server (a few seconds
            // after sign-in). Nothing of the account shows until it is.
            <span
              role="status"
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-[12.5px] font-semibold ring-1",
                dark ? "bg-white/10 text-cream ring-white/15" : "bg-card text-foreground ring-border",
              )}
            >
              <LuLoaderCircle className="size-4 animate-spin" aria-hidden />
              Signing in…
            </span>
          ) : linkError ? (
            <button
              type="button"
              onClick={retryLink}
              title={linkError}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-destructive px-3.5 text-[12.5px] font-semibold text-white"
            >
              <LuRefreshCw className="size-3.5" aria-hidden />
              Sign-in failed · Retry
            </button>
          ) : (
            <SignInButton
              className={cn(
                "h-9 rounded-full px-4 text-[13px] font-semibold",
                dark && "bg-gold text-navy hover:bg-gold/90",
              )}
            />
          )}
        </nav>
      </div>
    </header>
  );
}

/** Round icon link in the top bar, with an active (filled) state. */
function NavIcon({
  href,
  label,
  active,
  dark,
  children,
}: {
  href: string;
  label: string;
  active: boolean;
  dark?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={cn(
        "grid size-9 place-items-center rounded-full ring-1 transition-colors",
        active
          ? dark
            ? "bg-cream text-navy ring-transparent"
            : "bg-foreground text-background ring-transparent"
          : dark
            ? "bg-white/10 text-cream/75 ring-white/15 hover:text-cream"
            : "bg-card text-muted-foreground ring-border hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}
