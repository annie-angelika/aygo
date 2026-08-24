"use client";

// The bell: the signed-in guest's notifications, polled while the tab is open
// so a host sees a new registration without reloading. Marking read is
// optimistic (the badge clears instantly, the server catches up).

import { useCallback, useEffect } from "react";
import { useAsyncData } from "@/hooks/use-async-data";
import { useAuth } from "@/hooks/use-auth";
import { fetchNotifications, markNotificationsRead } from "@/lib/api";
import type { AppNotification } from "@/types";

const POLL_MS = 45_000;
const NONE: AppNotification[] = [];

export function useNotifications() {
  const { isAuthenticated } = useAuth();
  const { data, loading, refetch } = useAsyncData(
    (signal) => fetchNotifications(signal),
    [],
    { cacheKey: "notifications", enabled: isAuthenticated },
  );

  useEffect(() => {
    if (!isAuthenticated) return;
    const id = setInterval(() => {
      if (document.visibilityState === "visible") refetch();
    }, POLL_MS);
    return () => clearInterval(id);
  }, [isAuthenticated, refetch]);

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
