"use client";

// Admin session + dashboard data. The admin cookie is httpOnly, so "am I an
// admin" is asked of the server once on mount; login exchanges the admin key
// for the cookie (see lib/server/admin.ts).

import { useEffect, useState } from "react";
import { useAsyncData } from "@/hooks/use-async-data";
import {
  adminLogin,
  adminLogout,
  adminSeed,
  fetchAdminSession,
  fetchAdminStats,
  fetchReports,
  type EventReport,
} from "@/lib/api/admin";

const NO_REPORTS: EventReport[] = [];

export function useAdminSession() {
  // null = still checking with the server.
  const [admin, setAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchAdminSession()
      .then((a) => !cancelled && setAdmin(a))
      .catch(() => !cancelled && setAdmin(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (key: string) => {
    await adminLogin(key); // throws ApiError(401) on a bad key
    setAdmin(true);
  };

  const logout = async () => {
    await adminLogout().catch(() => {});
    setAdmin(false);
  };

  return { admin, login, logout };
}

export function useAdminStats(enabled: boolean) {
  const { data, loading, error, refetch } = useAsyncData(
    (signal) => fetchAdminStats(signal),
    [],
    { cacheKey: "admin-stats", enabled },
  );
  return { stats: data, loading, error, refetch };
}

export function useAdminReports(enabled: boolean) {
  const { data, loading, error, refetch } = useAsyncData(
    (signal) => fetchReports(signal),
    [],
    { cacheKey: "admin-reports", enabled },
  );
  return { reports: data ?? NO_REPORTS, loading, error, refetch };
}

/** Re-run the catalog seed; resolves to the seeded counts. */
export async function reseed() {
  return adminSeed();
}
