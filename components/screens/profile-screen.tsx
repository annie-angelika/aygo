"use client";

import { LuUserX } from "react-icons/lu";

import { useMyCollection } from "@/hooks/use-me";
import { usePublicProfile } from "@/hooks/use-public-profile";
import { useRegistrations } from "@/hooks/use-registrations";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { EventTimeline } from "@/components/event/event-timeline";
import { ProfileHeader } from "@/components/profile/profile-header";
import { HostingList } from "@/components/profile/hosting-list";
import { PassportCard } from "@/components/passport/passport-card";

/**
 * A profile page. Without `username` it's yours (identity, achievements, the
 * events you host with a way into each one's manage screen). With one it's
 * someone's public profile at /u/<username>: the same header, their
 * collection, and the public events they host.
 */
export function ProfileScreen({ username }: { username?: string }) {
  return username ? <PublicProfile username={username} /> : <OwnProfile />;
}

function OwnProfile() {
  const { me, email, stamps } = useMyCollection();
  // Real count only — the collection page shows the same number.
  const aygoCount = stamps.length;

  return (
    <Layout
      header={
        <ProfileHeader
          name={me.name}
          username={me.username}
          email={email}
          avatar={me.avatar}
          bio={me.bio}
          location={me.location}
          socials={me.socials}
          aygos={aygoCount}
        />
      }
      collection={<PassportCard count={aygoCount} href="/profile/collection" />}
      hosting={<HostingList />}
    />
  );
}

function PublicProfile({ username }: { username: string }) {
  const { profile, loading, missing } = usePublicProfile(username);
  const { isGoing } = useRegistrations();

  if (!profile) {
    return (
      <div className="px-4 pt-4 lg:mx-auto lg:w-full lg:max-w-xl lg:pt-8">
        {loading && !missing ? (
          <Skeleton className="h-48 rounded-2xl" />
        ) : (
          <EmptyState
            icon={LuUserX}
            title="Profile not found"
            subtitle={`Nobody on aygo goes by @${username}.`}
          />
        )}
      </div>
    );
  }

  return (
    <Layout
      header={
        <ProfileHeader
          name={profile.name}
          username={profile.username}
          avatar={profile.avatar}
          bio={profile.bio}
          location={profile.location}
          socials={profile.socials}
          aygos={profile.stamps.length}
        />
      }
      collection={
        <PassportCard count={profile.stamps.length} href={`/u/${profile.username}/collection`} />
      }
      hosting={
        profile.hosting.length > 0 ? (
          <EventTimeline events={profile.hosting} isGoing={isGoing} />
        ) : (
          <p className="text-[12.5px] text-muted-foreground">Not hosting anything yet.</p>
        )
      }
    />
  );
}

function Layout({
  header,
  collection,
  hosting,
}: {
  header: React.ReactNode;
  collection: React.ReactNode;
  hosting: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 px-4 pt-4 lg:grid lg:grid-cols-[380px_minmax(0,1fr)] lg:items-start lg:gap-12 lg:pt-8">
      <div className="flex flex-col gap-5 lg:sticky lg:top-24">
        {header}
        <section className="flex flex-col gap-3">
          <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">
            Achievements
          </h2>
          {collection}
        </section>
      </div>

      <div className="flex flex-col gap-5">
        <section className="flex flex-col gap-3">
          <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">
            Hosting
          </h2>
          {hosting}
        </section>
      </div>
    </div>
  );
}
