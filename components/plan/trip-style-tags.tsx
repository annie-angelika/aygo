import type { UserProfile } from "@/types";
import { cn } from "@/lib/utils";

const CAPITALIZE = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export type TripStyleTagsProps = {
  profile: Pick<UserProfile, "tripType" | "accessibility" | "interests">;
  className?: string;
};

type Tag = { emoji: string; label: string };

/**
 * Read-only chips that summarise the traveller's profile (trip type,
 * accessibility, interests). Edits happen in the profile screen — this
 * is just a glance at the saved preferences while planning.
 */
export function TripStyleTags({ profile, className }: TripStyleTagsProps) {
  const tags: Tag[] = [
    { emoji: "👥", label: CAPITALIZE(profile.tripType) },
    ...(profile.accessibility ? [{ emoji: "♿", label: "Accesible" }] : []),
    ...profile.interests
      .slice(0, 3)
      .map((i) => ({ emoji: interestEmoji(i), label: i })),
  ];

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {tags.map((t) => (
        <span
          key={t.label}
          className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11.5px] font-semibold text-slate-700 ring-1 ring-amber-200"
        >
          <span>{t.emoji}</span>
          {t.label}
        </span>
      ))}
    </div>
  );
}

function interestEmoji(interest: string): string {
  switch (interest) {
    case "Naturaleza":
      return "🌿";
    case "Cultura":
      return "🪘";
    case "Aventura":
      return "🎒";
    case "Fiestas":
      return "🎉";
    case "Gastronomía":
      return "🍽️";
    default:
      return "✨";
  }
}
