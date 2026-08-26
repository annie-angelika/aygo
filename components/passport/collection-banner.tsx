import { AygoStar, IllimaniRidge } from "@/components/ui/brand-icons";
import { cn } from "@/lib/utils";

// A small constellation of gold stars over the navy sky, plus one bright one.
const SKY = [
  "left-9 top-[22px] size-3.5 opacity-35",
  "left-[120px] top-[60px] size-2.5 opacity-25",
  "left-[210px] top-[30px] size-[18px] opacity-50",
  "left-[300px] top-[70px] size-3 opacity-30",
  "right-6 top-3.5 size-10",
];

/**
 * The banner at the top of your collection: a navy night sky scattered with
 * aygo stars, grounded by the Illimani ridge. The same sky for every level —
 * the stamps below are what grow.
 */
export function CollectionBanner({ className }: { className?: string }) {
  return (
    <div
      className={cn("relative h-[150px] overflow-hidden bg-navy", className)}
      aria-hidden
    >
      {SKY.map((pos) => (
        <AygoStar key={pos} className={cn("absolute text-gold", pos)} />
      ))}
      <IllimaniRidge />
    </div>
  );
}
