"use client";

import { LuGlobe } from "react-icons/lu";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TIMEZONES } from "@/lib/create-event";

/** Start/End date + time, with a timezone selector — the Luma "when" block. */
export function WhenCard({
  start,
  end,
  timezone,
  onStart,
  onEnd,
  onTimezone,
}: {
  start: string;
  end: string;
  timezone: string;
  onStart: (v: string) => void;
  onEnd: (v: string) => void;
  onTimezone: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="rounded-2xl bg-muted ring-1 ring-border">
        <WhenRow label="Start" dot="ring" value={start} onChange={onStart} />
        <div className="mx-3 h-px bg-border" />
        <WhenRow label="End" dot="hollow" value={end} onChange={onEnd} />
      </div>

      <Select value={timezone} onValueChange={(v) => onTimezone(v ?? TIMEZONES[0])}>
        <SelectTrigger className="h-11 w-full rounded-2xl bg-muted px-3.5 text-[13px] font-medium">
          <span className="flex items-center gap-2">
            <LuGlobe className="size-4 text-muted-foreground" aria-hidden />
            <SelectValue>{(v) => (v as string) ?? TIMEZONES[0]}</SelectValue>
          </span>
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          {TIMEZONES.map((tz) => (
            <SelectItem key={tz} value={tz}>
              {tz}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/** One row: a Start/End label with a timeline dot, plus date and time inputs. */
function WhenRow({
  label,
  dot,
  value,
  onChange,
}: {
  label: string;
  dot: "ring" | "hollow";
  value: string;
  onChange: (v: string) => void;
}) {
  const [date, time] = value.split("T");

  return (
    <div className="flex items-center gap-2 px-3 py-2.5">
      <span
        className={
          "size-2.5 shrink-0 rounded-full " +
          (dot === "ring" ? "bg-foreground" : "ring-2 ring-muted-foreground")
        }
        aria-hidden
      />
      <span className="min-w-0 flex-1 text-[13px] font-medium text-foreground">{label}</span>
      <input
        type="date"
        value={date ?? ""}
        onChange={(e) => onChange(`${e.target.value}T${time ?? "00:00"}`)}
        aria-label={`${label} date`}
        className="w-[108px] shrink rounded-lg bg-background px-2 py-1.5 text-[12.5px] font-medium text-foreground ring-1 ring-border outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <input
        type="time"
        value={time ?? ""}
        onChange={(e) => onChange(`${date ?? ""}T${e.target.value}`)}
        aria-label={`${label} time`}
        className="w-[104px] shrink rounded-lg bg-background px-2 py-1.5 text-[12.5px] font-medium text-foreground ring-1 ring-border outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  );
}
