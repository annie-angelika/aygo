import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";
import type { Attendee } from "@/types";

/**
 * The real guest list: people who actually RSVPed. Goers are guest sessions
 * (not linkable accounts), so rows are identity-only — name + avatar when they
 * saved a profile, "Guest" otherwise.
 */
export function GoingList({ people }: { people: Attendee[] }) {
  if (!people.length) return null;
  return (
    <div className="flex flex-col">
      {people.map((p, i) => (
        <div
          key={`${p.name}-${i}`}
          className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-muted/50"
        >
          <Avatar className="size-9">
            {p.avatar && <AvatarImage src={p.avatar} alt={p.name} />}
            <AvatarFallback>{initials(p.name)}</AvatarFallback>
          </Avatar>
          <p className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-foreground">
            {p.name}
          </p>
        </div>
      ))}
    </div>
  );
}
