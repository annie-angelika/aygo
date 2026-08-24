"use client";

import { LuGlobe } from "react-icons/lu";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePopover } from "@/components/create/date-popover";
import { TimePopover } from "@/components/create/time-popover";
import { TIMEZONES } from "@/lib/create-event";
import { formatDayPill, formatTimePill, todayValue } from "@/lib/date-utils";

/** A human reason the when block isn't valid yet, or null. Shared with the
 * create button so the hint and the disabled state agree. */
export function whenProblem(start: string, end: string): string | null {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (Number.isNaN(s) || Number.isNaN(e)) return "Pick a date and time";
  if (e < s) return "End is before start";
  if (e < Date.now() - 60 * 60 * 1000) return "That date has passed";
  return null;
}

/**
 * Start/End date + time, with a timezone selector — the Luma "when" block.
 * Past days are disabled in both pickers (an event can't be created in the
 * past), the end picker can't go before the start day, and any remaining
 * inconsistency (e.g. a past time today) is called out inline.
 */
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
  const today = todayValue();
  const startDay = start.split("T")[0] || today;
  const problem = whenProblem(start, end);
  // Moving the start past the end drags the end along (same gap as before).
  function changeStart(v: string) {
    onStart(v);
    const gap = new Date(end).getTime() - new Date(start).getTime();
    if (new Date(v).getTime() > new Date(end).getTime()) {
      const next = new Date(new Date(v).getTime() + Math.max(gap, 0));
      const p = (n: number) => String(n).padStart(2, "0");
      onEnd(
        `${next.getFullYear()}-${p(next.getMonth() + 1)}-${p(next.getDate())}T${p(next.getHours())}:${p(next.getMinutes())}`,
      );
    }
  }
  return (
    <div className="space-y-2">
      <div className="rounded-2xl bg-muted ring-1 ring-border">
        <WhenRow label="Start" dot="ring" value={start} min={today} onChange={changeStart} />
        <div className="mx-3 h-px bg-border" />
        <WhenRow label="End" dot="hollow" value={end} min={startDay > today ? startDay : today} onChange={onEnd} />
      </div>
      {problem && (
        <p className="px-1 text-[12px] font-medium text-destructive">{problem}</p>
      )}

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

const pill =
  "rounded-lg bg-background px-3 py-1.5 text-[12.5px] font-medium text-foreground ring-1 ring-border outline-none transition-colors hover:bg-muted data-popup-open:ring-2 data-popup-open:ring-ring";

/** One row: a Start/End label with a timeline dot, plus date and time pickers. */
function WhenRow({
  label,
  dot,
  value,
  min,
  onChange,
}: {
  label: string;
  dot: "ring" | "hollow";
  value: string;
  min?: string;
  onChange: (v: string) => void;
}) {
  const [date, time] = value.split("T");

  return (
    <div className="flex items-center gap-2 px-3.5 py-3">
      <span
        className={
          "size-2.5 shrink-0 rounded-full " +
          (dot === "ring" ? "bg-foreground" : "ring-2 ring-muted-foreground")
        }
        aria-hidden
      />
      <span className="min-w-0 flex-1 text-[13px] font-medium text-foreground">{label}</span>
      <DatePopover value={date ?? ""} min={min} onChange={(d) => onChange(`${d}T${time ?? "00:00"}`)}>
        <button type="button" className={pill}>
          {formatDayPill(date ?? "")}
        </button>
      </DatePopover>
      <TimePopover value={time ?? ""} onChange={(t) => onChange(`${date ?? ""}T${t}`)}>
        <button type="button" className={pill}>
          {formatTimePill(time ?? "")}
        </button>
      </TimePopover>
    </div>
  );
}
