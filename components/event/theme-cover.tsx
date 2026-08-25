import { AygoStar, IllimaniRidge } from "@/components/ui/brand-icons";
import { getTheme, getStyle } from "@/lib/create-themes";
import { getFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

/**
 * The cover an event gets when the host uploads no photo: its THEME, rendered
 * as the "You Are Invited" card — the same card the create flow previews, so
 * picking a theme is picking the cover. Sized by its container (container
 * query units), it stays faithful from an 80px list thumbnail to the event
 * page's hero. Purely decorative: pass `aria-hidden` context via the parent.
 */
export function ThemeCover({
  theme: id,
  className,
  children,
}: {
  theme?: string;
  className?: string;
  /** Overlays (badges, buttons) drawn on top of the card. */
  children?: React.ReactNode;
}) {
  const theme = getTheme(id ?? "aygo");
  // Themes declare their headline in px for a 300px card; scale it with the box.
  const px = Number(/text-\[(\d+)px\]/.exec(theme.title)?.[1] ?? 24);
  return (
    <div
      className={cn("@container relative aspect-square w-full overflow-hidden", className)}
      aria-hidden
    >
      <div
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center gap-[4cqw] px-[8cqw]",
          theme.cover,
        )}
      >
        {theme.id === "warp" && (
          <div className="absolute inset-0 opacity-60 [background:repeating-radial-gradient(circle_at_50%_120%,transparent_0,transparent_14px,rgba(139,92,246,0.5)_15px,transparent_16px)]" />
        )}
        {theme.id === "aygo" && <AygoCoverArt />}
        <p
          className={cn("relative text-center", theme.title, getStyle(theme.style).className)}
          style={{ fontFamily: getFont(theme.font).family, fontSize: `${(px / 3).toFixed(3)}cqw` }}
        >
          You
          <br />
          Are
          <br />
          Invited
        </p>
      </div>
      {children}
    </div>
  );
}

/**
 * The brand cover: a sprinkle of small gold stars, the big star above the
 * headline, and the Illimani ridge along the bottom edge.
 */
function AygoCoverArt() {
  return (
    <>
      <AygoStar className="absolute left-[7cqw] top-[9cqw] size-[4cqw] text-gold/35" />
      <AygoStar className="absolute right-[10cqw] top-[13cqw] size-[5cqw] text-gold/50" />
      <AygoStar className="absolute bottom-[18cqw] left-[19cqw] size-[3cqw] text-gold/30" />
      <IllimaniRidge className="h-[23cqw]" />
      <AygoStar className="relative size-[13cqw] text-gold" />
    </>
  );
}
