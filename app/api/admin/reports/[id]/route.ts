// PATCH /api/admin/reports/:id  { status } → resolve or reopen an inbox item.

import { getStore } from "@/lib/server/store";
import { requireAdmin } from "@/lib/server/admin";
import { pathId } from "@/lib/server/validate";
import { handler, noContent, readJson, HttpError } from "@/lib/server/http";

export const PATCH = handler(
  async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
    await requireAdmin(req);
    const id = pathId((await ctx.params).id);
    const { status } = await readJson<{ status?: string }>(req);
    if (status !== "open" && status !== "resolved")
      throw new HttpError(400, "status must be 'open' or 'resolved'");
    const found = await getStore().setReportStatus(id, status);
    if (!found) throw new HttpError(404, "Report not found");
    return noContent();
  },
);
