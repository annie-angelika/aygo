import { bannerForCount } from "@/lib/passport-banner";
import { cn } from "@/lib/utils";

/**
 * The looping banner at the top of your collection. The gif is chosen by how
 * many aygos you've collected (see `lib/passport-banner`), so higher levels
 * unlock new art. The backdrop matches the gif so any uncovered edge blends in,
 * and the upscaled pixel art is kept crisp rather than blurred.
 */
export function CollectionBanner({
  count = 0,
  className,
}: {
  count?: number;
  className?: string;
}) {
  const tier = bannerForCount(count);

  return (
    <div
      className={cn("relative h-32 overflow-hidden", className)}
      style={{ backgroundColor: tier.backdrop }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={tier.src}
        alt=""
        aria-hidden
        className="size-full object-cover object-center [image-rendering:pixelated]"
      />
    </div>
  );
}
