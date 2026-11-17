"use client";

// Your inbox: notifications (what happened) and messages (the threads you
// opened with hosts, and your reports). Opening the screen marks
// notifications read.

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { ScreenHeader } from "@/components/ui/screen-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationList } from "@/components/inbox/notification-list";
import { ThreadList } from "@/components/inbox/thread-list";
import { useNotifications } from "@/hooks/use-notifications";

export type InboxTab = "activity" | "messages";

/**
 * The tab lives in the URL (`/inbox?tab=messages&thread=<id>`), so a
 * notification about a reply can link straight to the conversation — even
 * when it is tapped from this very screen's Activity tab.
 */
export function InboxScreen({
  tab,
  thread,
}: {
  tab: InboxTab;
  /** The thread a notification pointed at: scrolled to and highlighted. */
  thread?: string;
}) {
  const router = useRouter();
  const { items, unread, loading, markAllRead } = useNotifications();

  // Seen is read: once the list is on screen, clear the badge.
  useEffect(() => {
    if (unread > 0) void markAllRead();
  }, [unread, markAllRead]);

  return (
    <div className="flex flex-col gap-4 px-4 pt-4 pb-10 lg:mx-auto lg:w-full lg:max-w-3xl lg:pt-8">
      <ScreenHeader
        title="Inbox"
        trailing={
          <Tabs
            value={tab}
            onValueChange={(v) =>
              router.replace(v === "messages" ? "/inbox?tab=messages" : "/inbox", { scroll: false })
            }
          >
            <TabsList>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />
      {tab === "activity" ? (
        <NotificationList items={items} loading={loading} />
      ) : (
        <ThreadList focus={thread} />
      )}
    </div>
  );
}
