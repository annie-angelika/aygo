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

/** The "Social Links" group: a prefixed handle input per network. */
export function SocialLinks({
  value,
  onChange,
}: {
  value: Socials;
  onChange: (next: Socials) => void;
}) {
  return (
    <Field label="Social Links">
      <div className="flex flex-col gap-2">
        {ROWS.map(({ key, Icon, prefix, placeholder }) => (
          <div
            key={key}
            className="flex items-center rounded-xl ring-1 ring-border focus-within:ring-2 focus-within:ring-ring"
          >
            {prefix ? (
              <span className="flex h-9 shrink-0 items-center gap-1.5 rounded-l-xl bg-muted px-2.5 text-[12px] text-muted-foreground">
                <Icon className="size-3.5" aria-hidden />
                {prefix}
              </span>
            ) : (
              <span className="grid h-9 w-9 shrink-0 place-items-center text-muted-foreground">
                <Icon className="size-3.5" aria-hidden />
              </span>
            )}
            <input
              value={value[key] ?? ""}
              onChange={(e) => onChange({ ...value, [key]: e.target.value })}
              placeholder={placeholder}
              aria-label={prefix ?? placeholder}
              className="h-9 w-full min-w-0 rounded-r-xl bg-background px-2.5 text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
        ))}
      </div>
    </Field>
  );
}
