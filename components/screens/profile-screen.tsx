"use client";

import { LuShare2, LuMapPinned } from "react-icons/lu";

import { useTraveler } from "@/hooks/use-traveler";
import { ShareButton } from "@/components/ui/share-button";
import { EmptyState } from "@/components/ui/empty-state";
import { ProfileHeader } from "@/components/profile/profile-header";
import { FollowButton } from "@/components/profile/follow-button";
import { RouteList } from "@/components/profile/route-list";
import { HostingList } from "@/components/profile/hosting-list";
import { PassportCard } from "@/components/passport/passport-card";
import { Skeleton } from "@/components/ui/skeleton";
import { LuUserX } from "react-icons/lu";

export function ProfileScreen({ username }: { username?: string }) {
  const { user, isSelf, displayStamps, loading } = useTraveler(username);

  if (!user) {
    return (
      <div className="px-4 pt-4">
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
    <div className="flex flex-col gap-5 px-4 pt-4">
      <ProfileHeader
        name={user.name}
        handle={user.username}
        avatar={user.avatar}
        bio={user.bio}
        location={user.location}
        joined={user.joined}
        socials={user.socials}
        followers={user.followers}
        following={user.following}
        visited={user.visits.length}
        action={
          isSelf ? (
            <ShareButton
              title={`${user.name} on aygo`}
              text={`Follow @${user.username} on aygo.`}
              className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full bg-card text-[13px] font-semibold text-foreground ring-1 ring-border transition-colors hover:bg-muted"
            >
              <LuShare2 className="size-4" aria-hidden />
              Share profile
            </ShareButton>
          ) : (
            <FollowButton />
          )
        }
      />

      <section className="flex flex-col gap-3">
        <h2 className="text-[15px] font-semibold tracking-tight text-foreground">
          Achievements
        </h2>
        <PassportCard
          count={aygoCount}
          href={`/user/${user.username}/collection`}
        />
      </section>

      {isSelf ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-[15px] font-semibold tracking-tight text-foreground">
            Hosting
          </h2>
          <HostingList />
        </section>
      ) : (
        <section className="flex flex-col gap-3">
          <h2 className="text-[15px] font-semibold tracking-tight text-foreground">
            Past Events
          </h2>
          {user.visits.length ? (
            <RouteList visits={user.visits} />
          ) : (
            <EmptyState
              icon={LuMapPinned}
              title="Nothing shared yet"
              subtitle="When they check in somewhere, it shows up here."
            />
          )}
        </section>
      )}
    </div>
  );
}
