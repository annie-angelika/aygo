"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

export function TabBar() {
  const pathname = usePathname();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center px-6">
      <nav
        aria-label="Navegación principal"
        className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/60 bg-white/70 px-2 py-2 shadow-[0_12px_30px_-12px_rgba(15,23,42,0.35)] backdrop-blur-xl"
      >
        {TABS.map((t) => {
          const active = pathname === t.href;
          const Icon = t.icon;
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-label={t.label}
              aria-current={active ? "page" : undefined}
              prefetch
              className={`flex size-11 items-center justify-center rounded-full transition-colors ${
                active
                  ? "bg-slate-900 text-white"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Icon active={active} />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
