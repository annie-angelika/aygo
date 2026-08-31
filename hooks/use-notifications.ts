"use client";

// The bell: the signed-in guest's notifications, polled while the tab is open
// so a host sees a new registration without reloading. Marking read is
// optimistic (the badge clears instantly, the server catches up).

import { useCallback } from "react";
import { useAsyncData } from "@/hooks/use-async-data";
import { useAuth } from "@/hooks/use-auth";
import { usePollWhileVisible } from "@/hooks/use-poll";
import { fetchNotifications, markNotificationsRead } from "@/lib/api";
import type { AppNotification } from "@/types";

const NONE: AppNotification[] = [];

export function useNotifications() {
  const { isAuthenticated } = useAuth();
  const { data, loading, refetch } = useAsyncData(
    (signal) => fetchNotifications(signal),
    [],
    { cacheKey: "notifications", enabled: isAuthenticated },
  );

  usePollWhileVisible(refetch, undefined, isAuthenticated);

  const markAllRead = useCallback(async () => {
    await markNotificationsRead().catch((e) =>
      console.error("mark read failed", e),
    );
    refetch();
  }, [refetch]);

  return {
    items: data?.items ?? NONE,
    unread: isAuthenticated ? (data?.unread ?? 0) : 0,
    loading,
    refetch,
    markAllRead,
  };
}
