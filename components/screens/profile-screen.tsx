"use client";

import { LuShare2, LuMapPinned, LuStamp } from "react-icons/lu";

import { useRegistrations } from "@/hooks/use-registrations";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/ui/share-button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { ProfileHeader } from "@/components/profile/profile-header";
import { FollowButton } from "@/components/profile/follow-button";
import { VisitCard } from "@/components/profile/visit-card";
import { LevelCard } from "@/components/passport/level-card";
import { StampGrid } from "@/components/passport/stamp-grid";
import { CURRENT_USER } from "@/lib/events-data";
import { PROFILE, VISITS } from "@/lib/profile-data";

export function ProfileScreen({ username }: { username?: string }) {
  const { stamps } = useRegistrations();
  const slots = Math.max(8, Math.ceil((stamps.length + 1) / 4) * 4);
  const handle = username ?? CURRENT_USER.username;
  const isSelf = handle === CURRENT_USER.username;

  return (
    <div className="flex flex-col gap-5 px-4 pt-4">
      <ProfileHeader
        name={CURRENT_USER.name}
        handle={handle}
        avatar={CURRENT_USER.avatar}
        bio={PROFILE.bio}
        location={PROFILE.location}
        followers={PROFILE.followers}
        following={PROFILE.following}
        visited={VISITS.length}
        action={
          <>
            {isSelf ? (
              <Button variant="outline" className="rounded-full">
                Edit profile
              </Button>
            ) : (
              <FollowButton />
            )}
            <ShareButton
              title={`${CURRENT_USER.name} on aygo`}
              text={`Follow @${handle} on aygo.`}
              className="grid size-8 place-items-center rounded-full bg-card text-foreground ring-1 ring-border"
            >
              <LuShare2 className="size-4" aria-hidden />
            </ShareButton>
          </>
        }
      />

      <LevelCard count={stamps.length} />

      <Tabs defaultValue="visited">
        <TabsList>
          <TabsTrigger value="visited">Visited</TabsTrigger>
          <TabsTrigger value="stamps">Stamps</TabsTrigger>
        </TabsList>

        <TabsContent value="visited" className="mt-4">
          {VISITS.length ? (
            <div className="flex flex-col gap-2.5">
              {VISITS.map((v) => (
                <VisitCard key={v.id} visit={v} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={LuMapPinned}
              title="No places visited yet"
              subtitle="Check in to an event to add your first place."
            />
          )}
        </TabsContent>

        <TabsContent value="stamps" className="mt-4">
          {stamps.length ? (
            <StampGrid stamps={stamps} slots={slots} />
          ) : (
            <EmptyState
              icon={LuStamp}
              title="Your passport is waiting for its first stamp"
              subtitle="Go to an event and check in to start collecting."
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
