import Link from "next/link";
import { LuMail } from "react-icons/lu";
import { FaInstagram, FaXTwitter } from "react-icons/fa6";

const LINKS = [
  { href: "/discover", label: "Discover" },
  { href: "/home", label: "Your events" },
  { href: "/settings", label: "Settings" },
];

const SOCIALS = [
  { href: "https://instagram.com", label: "Instagram", icon: FaInstagram },
  { href: "https://x.com", label: "X", icon: FaXTwitter },
  { href: "mailto:hello@aygo.app", label: "Email", icon: LuMail },
];

/**
 * Luma-style site footer — wordmark with social icons on top, a row of nav
 * links below. Lives at the bottom of long content screens (Home, Discover).
 *
 * `compact` trims the vertical padding for screens that pin a primary action
 * to the bottom (Event detail), so the footer and that button don't crowd.
 */
export function SiteFooter({ compact = false }: { compact?: boolean }) {
  return (
    <footer
      className={
        compact
          ? "border-t border-border/70 px-4 pb-5 pt-5"
          : "mt-10 border-t border-border/70 px-4 pb-10 pt-6"
      }
    >
      <div className="flex items-center justify-between">
        <span className="text-[19px] font-bold tracking-tight text-foreground">
          aygo<span className="text-amber-500">.</span>
        </span>

        <div className="flex items-center gap-1">
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
        className={`flex flex-wrap items-center gap-x-5 gap-y-2 ${compact ? "mt-3" : "mt-4"}`}
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
