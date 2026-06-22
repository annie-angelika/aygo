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
import { USERS, findUser, CURRENT_USERNAME } from "@/lib/users-data";
import type { Stamp } from "@/types";

export function ProfileScreen({ username }: { username?: string }) {
  const { stamps } = useRegistrations();
  const user = findUser(username ?? CURRENT_USERNAME) ?? USERS[CURRENT_USERNAME];
  const isSelf = user.username === CURRENT_USERNAME;

  // Your stamps live in localStorage; other travelers' come from their routes.
  const displayStamps: Stamp[] = isSelf
    ? stamps
    : user.visits.map((v) => ({
        eventId: v.id,
        title: v.place,
        category: v.category,
      }));
  const slots = Math.max(8, Math.ceil((displayStamps.length + 1) / 4) * 4);

  return (
    <div className="flex flex-col gap-5 px-4 pt-4">
      <ProfileHeader
        name={user.name}
        handle={user.username}
        avatar={user.avatar}
        bio={user.bio}
        location={user.location}
        followers={user.followers}
        following={user.following}
        visited={user.visits.length}
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
              title={`${user.name} on aygo`}
              text={`Follow @${user.username} on aygo.`}
              className="grid size-8 place-items-center rounded-full bg-card text-foreground ring-1 ring-border"
            >
              <LuShare2 className="size-4" aria-hidden />
            </ShareButton>
          </>
        }
      />

      <LevelCard count={displayStamps.length} />

      <Tabs defaultValue="routes">
        <TabsList>
          <TabsTrigger value="routes">Routes</TabsTrigger>
          <TabsTrigger value="stamps">Stamps</TabsTrigger>
        </TabsList>

        <TabsContent value="routes" className="mt-4">
          {user.visits.length ? (
            <div className="flex flex-col gap-2.5">
              {user.visits.map((v) => (
                <VisitCard key={v.id} visit={v} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={LuMapPinned}
              title={isSelf ? "No routes yet" : "No routes shared yet"}
              subtitle={
                isSelf
                  ? "Check in to an event to add your first place."
                  : "When they check in somewhere, it shows up here."
              }
            />
          )}
        </TabsContent>

        <TabsContent value="stamps" className="mt-4">
          {displayStamps.length ? (
            <StampGrid stamps={displayStamps} slots={slots} />
          ) : (
            <EmptyState
              icon={LuStamp}
              title="No stamps yet"
              subtitle="Go to an event and check in to start collecting."
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
