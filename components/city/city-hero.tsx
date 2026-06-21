import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { City } from "@/lib/cities-data";

/** Luma-style city banner: cover, landmark badge, identity, subscribe action. */
export function CityHero({
  city,
  subscribed,
  onToggleSubscribe,
}: {
  city: City;
  subscribed: boolean;
  onToggleSubscribe: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-3xl ring-1 ring-border">
      <div className="relative h-32">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://picsum.photos/seed/city-${city.slug}/800/400`}
          alt=""
          className="size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-black/0" />
        <span
          className={cn(
            "absolute left-4 top-4 grid size-11 place-items-center rounded-2xl text-white ring-2 ring-white/30",
            city.tint,
          )}
          aria-hidden
        >
          <city.Icon className="size-6" />
        </span>
      </div>
      <div className="flex items-end justify-between gap-3 bg-card p-4">
        <div className="min-w-0">
          <p className="text-[10.5px] font-semibold uppercase tracking-wider text-amber-600">
            What&apos;s happening
          </p>
          <h1 className="truncate text-[22px] font-semibold tracking-tight text-foreground">
            {city.name}
          </h1>
          <p className="text-[12.5px] text-muted-foreground">
            {city.country} · {city.eventCount} events
          </p>
        </div>
        <Button
          onClick={onToggleSubscribe}
          variant={subscribed ? "outline" : "default"}
          className="shrink-0 rounded-full"
        >
          {subscribed ? "Subscribed" : "Subscribe"}
        </Button>
      </div>
    </div>
  );
}
