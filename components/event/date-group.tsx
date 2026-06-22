/** A date header with a timeline rail, wrapping the rows for that day. */
export function DateGroup({
  label,
  weekday,
  children,
}: {
  label: string;
  weekday?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="relative pl-5">
      <span
        aria-hidden
        className="absolute left-0 top-1.5 size-2.5 rounded-full bg-foreground ring-4 ring-background"
      />
      <span
        aria-hidden
        className="absolute bottom-0 left-[4.5px] top-5 w-px bg-border"
      />
      <div className="mb-3 flex items-baseline gap-2">
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
