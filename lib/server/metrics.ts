// The traction report and its public links, over the store.

import "server-only";
import { randomBytes } from "crypto";
import { getStore } from "@/lib/server/store";
import { buildMetricsReport } from "@/lib/metrics";
import type { MetricShare, MetricsReport } from "@/types";

export async function metricsReport(): Promise<MetricsReport> {
  return buildMetricsReport(await getStore().metricsSource());
}

/** 24 URL-safe chars (144 bits): unguessable, short enough to read aloud. */
export function newShareId(): string {
  return randomBytes(18).toString("base64url");
}

/** A share that still opens: exists, not revoked, not expired. */
export function shareIsLive(share: MetricShare | null, now = Date.now()): share is MetricShare {
  if (!share || share.revokedAt) return false;
  return !share.expiresAt || new Date(share.expiresAt).getTime() > now;
}

/** Absolute URL of a share, on whatever host served the request. */
export function shareUrl(req: Request, id: string): string {
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? new URL(req.url).host;
  const proto = req.headers.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}/m/${id}`;
}
