// DELETE /api/admin/metrics/shares/:id → revoke a public link (it 404s from then on).

import { getStore } from "@/lib/server/store";
import { requireAdmin } from "@/lib/server/admin";
import { handler, noContent, HttpError } from "@/lib/server/http";

export const DELETE = handler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  await requireAdmin(req);
  const { id } = await ctx.params;
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(id)) throw new HttpError(400, "Invalid link id");
  if (!(await getStore().revokeMetricShare(id))) throw new HttpError(404, "No such link");
  return noContent();
});
