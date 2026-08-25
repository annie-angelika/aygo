// Luma-style "at a glance": going count, and how many of them checked in.

export function GuestProgress({
  going,
  checkedIn,
}: {
  going: number;
  checkedIn: number;
}) {
  const pct = going > 0 ? Math.min(100, (checkedIn / going) * 100) : 0;
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[15px] font-semibold tracking-tight text-foreground">
        <span className="text-[22px] tabular-nums tracking-[-0.03em]">{going}</span>{" "}
        going
      </p>
      {/* The check-in bar only means something once somebody is going. */}
      {going > 0 && (
        <>
          <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-gold transition-[width]"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-[12px] font-semibold text-gold-deep">
            {checkedIn} checked in
          </p>
        </>
      )}
    </div>
  );
}
