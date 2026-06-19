"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BookmarkIcon,
  CalendarIcon,
  GridIcon,
  HomeIcon,
  UserIcon,
} from "@/components/ui/icons";

type Tab = {
  href: "/home" | "/vibes" | "/plan" | "/journal" | "/profile";
  label: string;
  icon: (props: { active?: boolean }) => React.ReactNode;
};

const TABS: Tab[] = [
  { href: "/home", label: "Inicio", icon: HomeIcon },
  { href: "/vibes", label: "Vibes", icon: GridIcon },
  { href: "/plan", label: "Plan", icon: CalendarIcon },
  { href: "/journal", label: "Diario", icon: BookmarkIcon },
  { href: "/profile", label: "Perfil", icon: UserIcon },
];

// Each tab is size-11 (2.75rem) with gap-1 (0.25rem) between → a 3rem pitch.
// The indicator translates by `index * 3rem`, which is why a fixed-width,
// icon-only layout keeps the slide exact without measuring the DOM.
const PITCH_REM = 3;

export function TabBar() {
  const pathname = usePathname();
  // The home screen runs the dark violet theme; the nav matches it there and
  // stays light over the other (light) screens. The indicator stays branded.
  const dark = pathname === "/home";
  const activeIndex = Math.max(
    0,
    TABS.findIndex((t) => t.href === pathname),
  );

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center px-5">
      <nav
        aria-label="Navegación principal"
        className={cn(
          "pointer-events-auto relative flex items-center gap-1 rounded-full p-1.5 backdrop-blur-xl transition-colors",
          dark
            ? "bg-[#160d30]/85 ring-1 ring-white/10 shadow-[0_22px_45px_-15px_rgba(0,0,0,0.85)]"
            : "border border-white/60 bg-white/70 shadow-[0_12px_30px_-12px_rgba(15,23,42,0.35)]",
        )}
      >
        {/* One persistent indicator that slides between tabs. It never
            unmounts, so a plain CSS transform transition animates it across
            route changes — no animation library needed. */}
        <span
          aria-hidden
          className="absolute left-1.5 top-1.5 size-11 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-[0_10px_22px_-6px_rgba(217,70,239,0.85)] transition-transform duration-300 ease-out motion-reduce:transition-none"
          style={{ transform: `translateX(${activeIndex * PITCH_REM}rem)` }}
        />

        {TABS.map((t, i) => {
          const active = i === activeIndex;
          const Icon = t.icon;
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-label={t.label}
              aria-current={active ? "page" : undefined}
              prefetch
              className={cn(
                "relative z-10 flex size-11 items-center justify-center rounded-full transition-colors",
                active
                  ? "text-white"
                  : dark
                    ? "text-violet-200/55 hover:text-white"
                    : "text-slate-500 hover:text-slate-900",
              )}
            >
              <Icon active={active} />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
