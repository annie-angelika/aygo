// GET /api/metrics/:token → the live traction report as JSON, for anyone who
// holds a public link (the machine-readable twin of /m/:token). No cookies, no
// personal data — only counts. 404 for an unknown, expired or revoked link.

import { getStore } from "@/lib/server/store";
import { metricsReport, shareIsLive } from "@/lib/server/metrics";
import { rateLimit, LIMITS } from "@/lib/server/rate-limit";
import { handler, json, HttpError } from "@/lib/server/http";

export const GET = handler(async (req: Request, ctx: { params: Promise<{ token: string }> }) => {
  rateLimit(req, "metrics:public", null, LIMITS.publicMetrics, LIMITS.publicMetrics);
  const { token } = await ctx.params;
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(token)) throw new HttpError(404, "No such report");
  const share = await getStore().getMetricShare(token);
  if (!shareIsLive(share)) throw new HttpError(404, "No such report");
  const report = await metricsReport();
  return json({ report: { id: share.id, label: share.label }, ...report });
});
