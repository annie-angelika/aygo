"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const TABS = [
  { href: "/settings/account", label: "Account" },
  { href: "/settings/preferences", label: "Preferences" },
];

/**
 * Underline tabs that navigate between settings routes — the active one is navy
 * with a gold rule. On desktop the same links stack into a sidebar list and the
 * active one sits on a navy-soft pill instead of the rule.
 */
export function SettingsNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-5 border-b border-border lg:sticky lg:top-24 lg:flex-col lg:gap-1 lg:border-b-0">
      {TABS.map(({ href, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative px-0.5 py-2.5 text-[14px] transition-colors lg:rounded-xl lg:px-3.5",
              "after:absolute after:inset-x-0 after:bottom-[-1px] after:h-0.5 after:bg-gold after:transition-opacity lg:after:hidden",
              active
                ? "font-semibold text-foreground after:opacity-100 lg:bg-secondary"
                : "font-medium text-muted-foreground after:opacity-0 hover:text-foreground lg:hover:bg-muted/60",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
