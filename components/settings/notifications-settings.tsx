"use client";

import { LuChevronsUpDown } from "react-icons/lu";

import {
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuCheckboxItem,
  MenuSeparator,
} from "@/components/ui/menu";
import { cn } from "@/lib/utils";
import type { NotificationChannel } from "@/types";

const CHANNELS: {
  id: NotificationChannel;
  summary: string;
  menuLabel: string;
}[] = [
  { id: "email", summary: "Email", menuLabel: "Email" },
  { id: "whatsapp", summary: "WhatsApp", menuLabel: "WhatsApp" },
  { id: "push", summary: "Push", menuLabel: "Push Notification" },
];

// What you can be notified about. `hint` shows inside the dropdown.
const TYPES: { id: string; label: string; hint?: string }[] = [
  { id: "invites", label: "Event Invites" },
  { id: "reminders", label: "Event Reminders" },
  { id: "blasts", label: "Event Blasts" },
  {
    id: "updates",
    label: "Event Updates",
    hint: "If you turn off email updates, your calendar invite may become outdated.",
  },
  { id: "feedback", label: "Feedback Requests" },
];

const summarize = (channels: NotificationChannel[]) =>
  channels.length
    ? CHANNELS.filter((c) => channels.includes(c.id))
        .map((c) => c.summary)
        .join(", ")
    : "Off";

function NotificationRow({
  label,
  hint,
  channels,
  onChange,
}: {
  label: string;
  hint?: string;
  channels: NotificationChannel[];
  onChange: (next: NotificationChannel[]) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-3.5 py-3">
      <span className="min-w-0 text-[13px] font-semibold text-foreground">
        {label}
      </span>
      <Menu>
        <MenuTrigger
          aria-label={`${label} delivery channels`}
          className="inline-flex shrink-0 items-center gap-1.5 text-[13px] text-muted-foreground outline-none transition-colors hover:text-foreground"
        >
          {summarize(channels)}
          <LuChevronsUpDown className="size-3.5" aria-hidden />
        </MenuTrigger>
        <MenuContent className="min-w-60">
          <MenuItem
            onClick={() => onChange([])}
            className={cn(channels.length === 0 && "bg-muted")}
          >
            Off
          </MenuItem>
          <MenuSeparator />
          {CHANNELS.map(({ id, menuLabel }) => (
            <MenuCheckboxItem
              key={id}
              checked={channels.includes(id)}
              onCheckedChange={(checked) =>
                onChange(
                  checked
                    ? [...channels, id]
                    : channels.filter((c) => c !== id),
                )
              }
            >
              {menuLabel}
            </MenuCheckboxItem>
          ))}
          {hint && (
            <p className="px-2.5 pt-1.5 pb-1 text-[11.5px] leading-snug text-muted-foreground">
              {hint}
            </p>
          )}
        </MenuContent>
      </Menu>
    </div>
  );
}

/**
 * Notifications section — per event-type, a dropdown to pick which channels
 * deliver it (or turn it Off). Each change auto-persists via `onSetChannels`.
 */
export function NotificationsSettings({
  value,
  onSetChannels,
}: {
  value: Record<string, NotificationChannel[]>;
  onSetChannels: (typeId: string, channels: NotificationChannel[]) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-border">
      {TYPES.map(({ id, label, hint }, i) => (
        <div
          key={id}
          className={cn(i > 0 && "border-t border-border")}
        >
          <NotificationRow
            label={label}
            hint={hint}
            channels={value[id] ?? []}
            onChange={(next) => onSetChannels(id, next)}
          />
        </div>
      ))}
    </div>
  );
}
