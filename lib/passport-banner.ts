/**
 * Collection-banner art, tiered by how many aygos you've collected. Each level
 * unlocks a different looping gif at the top of your passport.
 *
 * To add a new level: drop the gif in `public/passport/banners/` and add a row
 * below (kept sorted by `min`, ascending). `bannerForCount` picks the highest
 * tier you've earned, so a single low row already covers everyone.
 */
export type BannerTier = {
  /** Minimum collected-aygo count to unlock this tier (inclusive). */
  min: number;
  /** Short label for the tier (handy for alt text / future "unlocked!" toasts). */
  label: string;
  /** Looping gif served from `/public`. */
  src: string;
  /** Backdrop behind the gif so any uncovered edge blends in. */
  backdrop: string;
};

const TIERS: BannerTier[] = [
  {
    min: 0,
    label: "Rainbow cat",
    src: "/passport/banners/rainbow-cat.gif",
    backdrop: "#1b1f3b",
  },
  // Next levels go here, e.g.:
  // { min: 10, label: "...", src: "/passport/banners/....gif", backdrop: "#..." },
];

/** The highest banner tier unlocked by `count` collected aygos. */
export function bannerForCount(count: number): BannerTier {
  let tier = TIERS[0];
  for (const t of TIERS) {
    if (count >= t.min) tier = t;
  }
  return tier;
}
