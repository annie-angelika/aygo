"use client";

// Your inbox: notifications (what happened) and messages (the threads you
// opened with hosts, and your reports). Opening the screen marks
// notifications read.

import { useEffect, useState } from "react";

import { ScreenHeader } from "@/components/ui/screen-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationList } from "@/components/inbox/notification-list";
import { ThreadList } from "@/components/inbox/thread-list";
import { useNotifications } from "@/hooks/use-notifications";

type Tab = "activity" | "messages";

export function InboxScreen() {
  const [tab, setTab] = useState<Tab>("activity");
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
          <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
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
        <ThreadList />
      )}
    </div>
  );
}
