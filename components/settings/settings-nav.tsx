"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const TABS = [
  { href: "/settings/account", label: "Account" },
  { href: "/settings/preferences", label: "Preferences" },
];

/** Luma-style underline tabs that navigate between settings routes. */
export function SettingsNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-5 border-b border-border">
      {TABS.map(({ href, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative px-0.5 py-2.5 text-sm font-medium transition-colors",
              "after:absolute after:inset-x-0 after:bottom-[-1px] after:h-0.5 after:bg-foreground after:transition-opacity",
              active
                ? "text-foreground after:opacity-100"
                : "text-foreground/55 after:opacity-0 hover:text-foreground",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
