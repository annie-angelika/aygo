import { cn } from "@/lib/utils";

/**
 * A date header with a timeline rail, wrapping the rows for that day. The header
 * (with its rail dot) is sticky so the date stays visible while you scroll a
 * long, busy day. `offset` is the sticky top inset — `top-0` inside a scroll
 * container (the map), or below a sticky top bar on document-scroll pages.
 */
export function DateGroup({
  label,
  weekday,
  offset = "top-0",
  children,
}: {
  label: string;
  weekday?: string;
  offset?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="relative pl-5">
      {/* The rail line runs the full height of the day; the dot rides with the
          sticky header so the marker stays put alongside the date. */}
      <span
        aria-hidden
        className="absolute bottom-0 left-[4.5px] top-6 w-px bg-border"
      />
      <div
        className={cn(
          "sticky z-10 -ml-5 mb-3 flex items-center gap-2 bg-background py-1.5 pl-5",
          offset,
        )}
      >
        <span
          aria-hidden
          className="absolute left-0 top-1/2 size-2.5 -translate-y-1/2 rounded-full bg-foreground ring-4 ring-background"
        />
        <h2 className="text-[15px] font-semibold text-foreground">{label}</h2>
        {weekday && (
          <span className="text-[13px] capitalize text-muted-foreground">
            {weekday}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}
