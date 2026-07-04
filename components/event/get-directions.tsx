// "Get directions" — deep links that open real turn-by-turn navigation in the
// app the user already has. No API keys: these are universal URL schemes.
// With coordinates the destination is exact; otherwise it falls back to a
// text search for "place, city".

import { FaWaze, FaApple, FaGoogle } from "react-icons/fa6";

import type { AygoEvent } from "@/types";

function destinations(event: AygoEvent) {
  const hasCoords = event.lat != null && event.lng != null;
  const dest = hasCoords
    ? `${event.lat},${event.lng}`
    : encodeURIComponent(`${event.place}, ${event.city}, Bolivia`);
  return [
    {
      name: "Google Maps",
      Icon: FaGoogle,
      href: `https://www.google.com/maps/dir/?api=1&destination=${dest}`,
    },
    {
      name: "Apple Maps",
      Icon: FaApple,
      href: `https://maps.apple.com/?daddr=${dest}`,
    },
    {
      name: "Waze",
      Icon: FaWaze,
      href: hasCoords
        ? `https://waze.com/ul?ll=${dest}&navigate=yes`
        : `https://waze.com/ul?q=${dest}&navigate=yes`,
    },
  ];
}

/** One pill per navigation app; each opens the native app on mobile. */
export function GetDirections({ event }: { event: AygoEvent }) {
  return (
    <div className="flex gap-2">
      {destinations(event).map(({ name, Icon, href }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-card px-3 py-2 text-[12px] font-semibold text-foreground ring-1 ring-border transition-colors hover:bg-muted"
        >
          <Icon className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">{name}</span>
        </a>
      ))}
    </div>
  );
}
