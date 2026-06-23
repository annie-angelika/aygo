"use client";

import { LuChevronDown, LuGlobe, LuLock, LuPlus, LuCheck, LuInfo } from "react-icons/lu";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Menu, MenuTrigger, MenuContent, MenuItem } from "@/components/ui/menu";
import { CALENDARS, type Visibility } from "@/lib/create-event";
import { cn } from "@/lib/utils";

const pill =
  "flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-[13px] font-semibold text-foreground ring-1 ring-border outline-none transition-colors hover:bg-muted/70 data-popup-open:bg-muted/70";

/** Calendar + visibility — the two Luma pills that sit above the event name. */
export function AudienceRow({
  calendarId,
  onCalendarChange,
  visibility,
  onVisibilityChange,
}: {
  calendarId: string;
  onCalendarChange: (id: string) => void;
  visibility: Visibility;
  onVisibilityChange: (v: Visibility) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <CalendarMenu value={calendarId} onChange={onCalendarChange} />
      <VisibilityMenu value={visibility} onChange={onVisibilityChange} />
    </div>
  );
}

function CalendarMenu({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const current = CALENDARS.find((c) => c.id === value) ?? CALENDARS[0];
  return (
    <Menu>
      <MenuTrigger className={cn(pill, "min-w-0")}>
        <Avatar className="size-5">
          <AvatarImage src={current.avatar} alt="" />
        </Avatar>
        <span className="truncate">{current.name}</span>
        <LuChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      </MenuTrigger>
      <MenuContent align="start" className="min-w-64 p-2">
        <p className="px-2 pt-1 pb-2 text-[11.5px] text-muted-foreground">
          Choose the calendar of the event:
        </p>
        {CALENDARS.map((c) => (
          <MenuItem
            key={c.id}
            onClick={() => onChange(c.id)}
            className="gap-2.5 px-2 py-2"
          >
            <Avatar className="size-7">
              <AvatarImage src={c.avatar} alt="" />
            </Avatar>
            <span className="flex-1 text-[14px] font-medium text-foreground">{c.name}</span>
            {c.id === value && <LuCheck className="size-4 text-foreground" aria-hidden />}
          </MenuItem>
        ))}
        <MenuItem className="gap-2.5 px-2 py-2 text-muted-foreground">
          <span className="grid size-7 place-items-center rounded-full bg-muted">
            <LuPlus className="size-4" aria-hidden />
          </span>
          <span className="text-[14px] font-medium">Create Calendar</span>
        </MenuItem>
        <p className="flex gap-2 px-2 pt-2 text-[11.5px] text-muted-foreground">
          <LuInfo className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          Creating the event under a calendar grants its admins manage access.
        </p>
      </MenuContent>
    </Menu>
  );
}

const VISIBILITIES: {
  value: Visibility;
  Icon: typeof LuGlobe;
  label: string;
  desc: string;
}[] = [
  { value: "public", Icon: LuGlobe, label: "Public", desc: "Shown on your calendar and eligible to be featured." },
  { value: "private", Icon: LuLock, label: "Private", desc: "Unlisted. Only people with the link can register." },
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
      <MenuTrigger className={pill}>
        <current.Icon className="size-4 text-muted-foreground" aria-hidden />
        <span>{current.label}</span>
        <LuChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
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
