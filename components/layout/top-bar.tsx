"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LuTicket, LuCompass } from "react-icons/lu";

import { ProfileMenu } from "@/components/layout/profile-menu";
import { cn } from "@/lib/utils";

/**
 * Luma-style top app bar — the whole navigation. Wordmark and the ticket open
 * your events (Home), the compass opens Discover, and the avatar opens your
 * profile (with a small level badge as the gamification hint).
 */
export function TopBar() {
  const pathname = usePathname();
  const onHome = pathname.startsWith("/home");
  const onDiscover = pathname.startsWith("/discover");
  const onProfile = pathname.startsWith("/user") || pathname.startsWith("/settings");

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-2.5">
        <Link
          href="/home"
          aria-label="aygo, home"
          className="text-[19px] font-bold tracking-tight text-foreground"
        >
          aygo<span className="text-amber-500">.</span>
        </Link>

        <nav className="flex items-center gap-2">
          <NavIcon href="/discover" label="Discover" active={onDiscover}>
            <LuCompass className="size-[18px]" />
          </NavIcon>

          <NavIcon href="/home" label="Your events" active={onHome}>
            <LuTicket className="size-[18px]" />
          </NavIcon>

          <ProfileMenu active={onProfile} />
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
  children,
}: {
  href: string;
  label: string;
  active: boolean;
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
          ? "bg-foreground text-background ring-transparent"
          : "bg-card text-muted-foreground ring-border hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}
