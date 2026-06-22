"use client";

import { LuShare2, LuMapPinned } from "react-icons/lu";

import { useTraveler } from "@/hooks/use-traveler";
import { ShareButton } from "@/components/ui/share-button";
import { EmptyState } from "@/components/ui/empty-state";
import { ProfileHeader } from "@/components/profile/profile-header";
import { FollowButton } from "@/components/profile/follow-button";
import { RouteList } from "@/components/profile/route-list";
import { PassportCard } from "@/components/passport/passport-card";

export function ProfileScreen({ username }: { username?: string }) {
  const { user, isSelf, displayStamps } = useTraveler(username);

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
          <>
            {!isSelf && <FollowButton />}
            <ShareButton
              title={`${user.name} on aygo`}
              text={`Follow @${user.username} on aygo.`}
              className="grid size-8 place-items-center rounded-full bg-card text-foreground ring-1 ring-border"
            >
              <LuShare2 className="size-4" aria-hidden />
            </ShareButton>
          </>
        }
      />

      <PassportCard
        count={displayStamps.length}
        href={`/user/${user.username}/passport`}
      />

      <section className="flex flex-col gap-3">
        <h2 className="text-[15px] font-semibold tracking-tight text-foreground">
          Past Events
        </h2>
        {user.visits.length ? (
          <RouteList visits={user.visits} />
        ) : (
          <EmptyState
            icon={LuMapPinned}
            title={isSelf ? "No events yet" : "Nothing shared yet"}
            subtitle={
              isSelf
                ? "The events you attend will show up here."
                : "When they check in somewhere, it shows up here."
            }
          />
        )}
      </section>
    </div>
  );
}
