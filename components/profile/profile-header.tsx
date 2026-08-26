import {
  LuMapPin,
  LuInstagram,
  LuTwitter,
  LuLinkedin,
  LuYoutube,
  LuGlobe,
} from "react-icons/lu";
import { FaTiktok } from "react-icons/fa6";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Stat } from "@/components/ui/stat";
import { Separator } from "@/components/ui/separator";
import { cn, initials } from "@/lib/utils";
import type { Socials } from "@/types";

const SOCIAL_LINKS = [
  { key: "instagram", Icon: LuInstagram, base: "https://instagram.com/", label: "Instagram" },
  { key: "x", Icon: LuTwitter, base: "https://x.com/", label: "X" },
  { key: "youtube", Icon: LuYoutube, base: "https://youtube.com/@", label: "YouTube" },
  { key: "tiktok", Icon: FaTiktok, base: "https://tiktok.com/@", label: "TikTok" },
  { key: "linkedin", Icon: LuLinkedin, base: "https://linkedin.com/in/", label: "LinkedIn" },
  { key: "website", Icon: LuGlobe, base: "", label: "Website" },
] as const;

/** Website handles store a full URL; everything else stores a handle. */
const hrefFor = (base: string, value: string) =>
  base ? `${base}${value}` : /^https?:\/\//.test(value) ? value : `https://${value}`;

function SocialRow({ socials, className }: { socials: Socials; className?: string }) {
  const items = SOCIAL_LINKS.filter((s) => socials[s.key]);
  if (!items.length) return null;
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {items.map(({ key, Icon, base, label }) => (
        <a
          key={key}
          href={hrefFor(base, socials[key]!)}
          target="_blank"
          rel="noreferrer"
          aria-label={label}
          className="grid size-8 place-items-center rounded-full bg-card text-muted-foreground ring-1 ring-border transition-colors hover:bg-muted hover:text-foreground"
        >
          <Icon className="size-4" aria-hidden />
        </a>
      ))}
    </div>
  );
}

/** Luma-style identity block: avatar beside name + socials, then meta + the aygo count. */
export function ProfileHeader({
  name,
  username,
  email,
  avatar,
  bio,
  location,
  socials,
  aygos,
  action,
}: {
  name: string;
  /** The public handle (/u/<username>); null while one hasn't been picked. */
  username?: string | null;
  /** Your own sign-in email (self view only), under the handle. */
  email?: string | null;
  avatar: string;
  bio: string;
  location: string;
  socials?: Socials;
  /** Real stamp count — the same number the collection page shows. */
  aygos: number;
  action?: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-start gap-4">
        <Avatar className="size-20 shrink-0 ring-1 ring-border">
          {avatar && <AvatarImage src={avatar} alt={name} />}
          <AvatarFallback className="bg-navy text-[24px] font-semibold text-cream">
            {initials(name)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[26px] font-bold leading-[1.15] tracking-[-0.03em] text-foreground">
            {name}
          </h1>
          {username && (
            <p className="mt-0.5 truncate text-[13px] text-muted-foreground">@{username}</p>
          )}
          {email && (
            <p className="truncate text-[12px] text-muted-foreground/80">{email}</p>
          )}
          {socials && <SocialRow socials={socials} className="mt-2" />}
        </div>
      </div>

      {bio && (
        <p className="mt-3 text-[13px] leading-snug text-foreground/80">{bio}</p>
      )}

      {location && (
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <LuMapPin className="size-3.5" aria-hidden />
            {location}
          </span>
        </div>
      )}

      <div className="mt-3">
        <Stat inline value={aygos} label={aygos === 1 ? "aygo" : "aygos"} />
      </div>

      {action && <div className="mt-4">{action}</div>}

      <Separator className="mt-4" />
    </div>
  );
}
