"use client";

import { LuUserX } from "react-icons/lu";

import { useTraveler } from "@/hooks/use-traveler";
import { EmptyState } from "@/components/ui/empty-state";
import { ProfileHeader } from "@/components/profile/profile-header";
import { HostingList } from "@/components/profile/hosting-list";
import { PassportCard } from "@/components/passport/passport-card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProfileScreen({ username }: { username?: string }) {
  const { user, isSelf, displayStamps, loading } = useTraveler(username);

  if (!user) {
    return (
      <div className="px-4 pt-4 lg:mx-auto lg:w-full lg:max-w-xl lg:pt-8">
        {loading ? (
          <Skeleton className="h-48 rounded-2xl" />
        ) : (
          <EmptyState
            icon={LuUserX}
            title="Traveler not found"
            subtitle="This profile doesn't exist (or hasn't joined aygo yet)."
          />
        )}
      </div>
    );
  }

  // Real count only — the collection page shows the same number.
  const aygoCount = displayStamps.length;

  return (
    <div className="flex flex-col gap-5 px-4 pt-4 lg:grid lg:grid-cols-[380px_minmax(0,1fr)] lg:items-start lg:gap-12 lg:pt-8">
      <div className="flex flex-col gap-5 lg:sticky lg:top-24">
        <ProfileHeader
          name={user.name}
          handle={user.username}
          avatar={user.avatar}
          bio={user.bio}
          location={user.location}
          joined={user.joined}
          socials={user.socials}
          aygos={aygoCount}
        />

        <section className="flex flex-col gap-3">
          <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">
            Achievements
          </h2>
          <PassportCard
            count={aygoCount}
            href={`/user/${user.username}/collection`}
          />
        </section>
      </div>

      {isSelf && (
        <div className="flex flex-col gap-5">
          <section className="flex flex-col gap-3">
            <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">
              Hosting
            </h2>
            <HostingList />
          </section>
        </div>
      )}
    </div>
  );
}
