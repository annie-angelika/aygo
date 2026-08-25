import type { IconType } from "react-icons";
import { LuInstagram, LuTwitter, LuLinkedin, LuYoutube, LuGlobe } from "react-icons/lu";
import { FaTiktok } from "react-icons/fa6";

import { Field } from "@/components/ui/field";
import type { Socials } from "@/types";

type Row = {
  key: keyof Socials;
  Icon: IconType;
  prefix?: string;
  placeholder: string;
};

const ROWS: Row[] = [
  { key: "instagram", Icon: LuInstagram, prefix: "instagram.com/", placeholder: "handle" },
  { key: "x", Icon: LuTwitter, prefix: "x.com/", placeholder: "handle" },
  { key: "youtube", Icon: LuYoutube, prefix: "youtube.com/@", placeholder: "username" },
  { key: "tiktok", Icon: FaTiktok, prefix: "tiktok.com/@", placeholder: "username" },
  { key: "linkedin", Icon: LuLinkedin, prefix: "linkedin.com/in/", placeholder: "handle" },
  { key: "website", Icon: LuGlobe, placeholder: "Your website" },
];

/** The "Social links" card: one prefixed handle row per network, hairline-split. */
export function SocialLinks({
  value,
  onChange,
}: {
  value: Socials;
  onChange: (next: Socials) => void;
}) {
  return (
    <Field label="Social links">
      <div className="flex flex-col divide-y divide-border overflow-hidden rounded-xl bg-card ring-1 ring-border focus-within:ring-2 focus-within:ring-ring">
        {ROWS.map(({ key, Icon, prefix, placeholder }) => (
          <div key={key} className="flex items-center gap-2.5 px-3">
            <span className="inline-flex h-10 shrink-0 items-center gap-2 text-[13px] text-muted-foreground">
              <Icon className="size-3.5" aria-hidden />
              {prefix}
            </span>
            <input
              value={value[key] ?? ""}
              onChange={(e) => onChange({ ...value, [key]: e.target.value })}
              placeholder={placeholder}
              aria-label={prefix ?? placeholder}
              className="h-10 w-full min-w-0 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
        ))}
      </div>
    </Field>
  );
}
