"use client";

import type { IconType } from "react-icons";
import { LuBell, LuMail } from "react-icons/lu";
import { FaWhatsapp } from "react-icons/fa6";

import { cn } from "@/lib/utils";
import type { NotificationChannel } from "@/types";

const CHANNELS: { id: NotificationChannel; label: string; Icon: IconType }[] = [
  { id: "email", label: "Email", Icon: LuMail },
  { id: "whatsapp", label: "WhatsApp", Icon: FaWhatsapp },
  { id: "push", label: "Push", Icon: LuBell },
];

// What you can be notified about. Grouped the way Luma groups them.
const TYPES: { id: string; label: string; hint: string }[] = [
  { id: "invites", label: "Event Invites", hint: "When a host invites you to an event." },
  { id: "reminders", label: "Event Reminders", hint: "Before an event you're attending starts." },
  { id: "blasts", label: "Event Blasts", hint: "Announcements a host sends to attendees." },
  { id: "updates", label: "Event Updates", hint: "Time, place or detail changes." },
  { id: "feedback", label: "Feedback Requests", hint: "After an event, to rate your experience." },
];

function ChannelToggle({
  Icon,
  label,
  active,
  onClick,
}: {
  Icon: IconType;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold transition-colors",
        active
          ? "bg-foreground text-background"
          : "text-muted-foreground ring-1 ring-border hover:bg-muted",
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {label}
    </button>
  );
}

/**
 * Notifications section — per event-type, toggle which channels deliver it.
 * Each change auto-persists via the parent's `onToggle`.
 */
export function NotificationsSettings({
  value,
  onToggle,
}: {
  value: Record<string, NotificationChannel[]>;
  onToggle: (typeId: string, channel: NotificationChannel) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-border">
      {TYPES.map(({ id, label, hint }, i) => {
        const channels = value[id] ?? [];
        return (
          <div
            key={id}
            className={cn(
              "flex flex-col gap-2.5 px-3.5 py-3",
              i > 0 && "border-t border-border",
            )}
          >
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-foreground">{label}</p>
              <p className="text-[11.5px] text-muted-foreground">{hint}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CHANNELS.map(({ id: cid, label: clabel, Icon }) => (
                <ChannelToggle
                  key={cid}
                  Icon={Icon}
                  label={clabel}
                  active={channels.includes(cid)}
                  onClick={() => onToggle(id, cid)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
