import Link from "next/link";
import { FaInstagram, FaTiktok } from "react-icons/fa6";

import { Logo } from "@/components/layout/logo";

const LINKS = [
  { href: "/discover", label: "Discover" },
  { href: "/home", label: "Your events" },
  { href: "/settings", label: "Settings" },
];

const SOCIALS = [
  { href: "https://www.tiktok.com/@go.aygo", label: "TikTok", icon: FaTiktok },
  { href: "https://www.instagram.com/aygo.bo/", label: "Instagram", icon: FaInstagram },
];

/**
 * Luma-style site footer — wordmark with social icons on top, a row of nav
 * links below. Lives at the bottom of long content screens (Home, Discover).
 * On desktop it collapses to one row: wordmark and links on the left, socials
 * on the right (the top row's box dissolves with `lg:contents` so its children
 * join the same flex line, ordered by `lg:order-*`).
 *
 * `compact` trims the vertical padding for screens that pin a primary action
 * to the bottom (Event detail), so the footer and that button don't crowd.
 */
export function SiteFooter({ compact = false }: { compact?: boolean }) {
  return (
    <footer
      className={
        compact
          ? "border-t border-border/70 px-4 pb-5 pt-5 lg:flex lg:items-center lg:justify-between lg:gap-8"
          : "mt-10 border-t border-border/70 px-4 pb-10 pt-6 lg:flex lg:items-center lg:justify-between lg:gap-8"
      }
    >
      <div className="flex items-center justify-between lg:contents">
        <Logo wordmark="always" />

        <div className="flex items-center gap-1 lg:order-3 lg:ml-auto">
          {SOCIALS.map(({ href, label, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
            >
              <Icon className="size-[18px]" />
            </a>
          ))}
        </div>
      </div>

      <nav
        className={`flex flex-wrap items-center gap-x-5 gap-y-2 lg:order-2 lg:mt-0 ${compact ? "mt-3" : "mt-4"}`}
      >
        {LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="text-[15px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
