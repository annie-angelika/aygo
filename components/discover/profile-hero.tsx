import { LuMap, LuGlobe } from "react-icons/lu";
import { FaInstagram, FaXTwitter, FaYoutube, FaLinkedin } from "react-icons/fa6";
import type { IconType } from "react-icons";

import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";

const SOCIALS: { Icon: IconType; label: string }[] = [
  { Icon: FaInstagram, label: "Instagram" },
  { Icon: FaXTwitter, label: "X" },
  { Icon: FaYoutube, label: "YouTube" },
  { Icon: FaLinkedin, label: "LinkedIn" },
  { Icon: LuGlobe, label: "Website" },
];

/**
 * Generic Luma-style header: a full-bleed cover banner with an overlaid back
 * button and logo tile sitting on it, then identity (badge · title · meta ·
 * blurb), a follow action, and social links below. The banner runs edge-to-edge
 * and the content below sits directly on the page. Callers supply the `logo`
 * node (an icon tile or an image) and `meta` row so the same shell serves both
 * city and community-calendar pages.
 */
export function ProfileHero({
  cover,
  logo,
  name,
  meta,
  blurb,
  badge,
  following,
  onToggleFollow,
}: {
  cover: string;
  logo: React.ReactNode;
  name: string;
  meta: React.ReactNode;
  blurb: string;
  badge?: React.ReactNode;
  following: boolean;
  onToggleFollow: () => void;
}) {
  return (
    // Break out of the page's px-4 / pt-3 so the banner runs full-bleed.
    <div className="-mx-4 -mt-3">
      <div className="relative h-36">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cover} alt="" className="size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10" />
        <BackButton className="absolute left-4 top-4 border-0 bg-white text-foreground shadow-md ring-1 ring-black/5 hover:bg-white" />
        {/* The logo sits on the banner, anchored to its bottom-left edge. */}
        <div className="absolute bottom-3 left-4">{logo}</div>
      </div>

      <div className="px-4 pb-1 pt-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {badge && <div className="mb-2">{badge}</div>}
            <h1 className="text-[27px] font-semibold leading-tight tracking-tight text-foreground">
              {name}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-muted-foreground">
              {meta}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              onClick={onToggleFollow}
              variant={following ? "outline" : "default"}
              className="shrink-0 rounded-full px-5"
            >
              {following ? "Following" : "Follow"}
            </Button>
            <Button
              size="icon"
              variant="outline"
              aria-label="View on map"
              className="shrink-0 rounded-full"
            >
              <LuMap className="size-4" />
            </Button>
          </div>
        </div>

        <p className="mt-3 text-[13px] leading-relaxed text-foreground/80">
          {blurb}
        </p>

        <div className="mt-3.5 flex items-center gap-1.5">
          {SOCIALS.map(({ Icon, label }) => (
            <button
              key={label}
              type="button"
              aria-label={label}
              className="grid size-8 place-items-center rounded-lg text-muted-foreground ring-1 ring-border transition-colors hover:bg-muted hover:text-foreground"
            >
              <Icon className="size-[15px]" aria-hidden />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
