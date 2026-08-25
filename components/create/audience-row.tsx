"use client";

import { LuChevronDown, LuGlobe, LuLock, LuCheck } from "react-icons/lu";

import { Menu, MenuTrigger, MenuContent, MenuItem } from "@/components/ui/menu";
import type { Visibility } from "@/lib/create-event";
import { cn } from "@/lib/utils";

const pill =
  "inline-flex h-[34px] items-center gap-1.5 rounded-full bg-card pl-2 pr-3 text-[12.5px] font-semibold text-foreground ring-1 ring-border outline-none transition-colors hover:bg-muted/50 data-popup-open:bg-muted/50";

/** Visibility pill (Public / Private) that sits above the event name. */
export function AudienceRow({
  visibility,
  onVisibilityChange,
}: {
  visibility: Visibility;
  onVisibilityChange: (v: Visibility) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      <VisibilityMenu value={visibility} onChange={onVisibilityChange} />
    </div>
  );
}

const VISIBILITIES: {
  value: Visibility;
  Icon: typeof LuGlobe;
  label: string;
  desc: string;
}[] = [
  { value: "public", Icon: LuGlobe, label: "Public", desc: "Listed in Discover and eligible to be featured." },
  {
    value: "private",
    Icon: LuLock,
    label: "Private",
    desc: "Unlisted — hidden from Discover and lists; only people with the link can see and register.",
  },
];

function VisibilityMenu({
  value,
  onChange,
}: {
  value: Visibility;
  onChange: (v: Visibility) => void;
}) {
  const current = VISIBILITIES.find((v) => v.value === value) ?? VISIBILITIES[0];
  return (
    <Menu>
      <MenuTrigger className={cn(pill, "pl-3")}>
        <current.Icon className="size-3.5 text-muted-foreground" aria-hidden />
        <span>{current.label}</span>
        <LuChevronDown className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
      </MenuTrigger>
      <MenuContent className="min-w-72 p-2">
        {VISIBILITIES.map((v) => (
          <MenuItem
            key={v.value}
            onClick={() => onChange(v.value)}
            className="items-start gap-2.5 px-2 py-2"
          >
            <v.Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-semibold text-foreground">{v.label}</span>
              <span className="block text-[12px] text-muted-foreground">{v.desc}</span>
            </span>
            {v.value === value && (
              <LuCheck className="mt-0.5 size-4 shrink-0 text-foreground" aria-hidden />
            )}
          </MenuItem>
        ))}
      </MenuContent>
    </Menu>
  );
}
