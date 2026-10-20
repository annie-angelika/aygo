// Public links to the live traction report (aygo.app/m/<id>). Admin only.
//   GET  → every link, newest first, each with its absolute `url`
//   POST { label, expiresInDays? } → mint one (unguessable id, optional expiry)

import { getStore } from "@/lib/server/store";
import { requireAdmin } from "@/lib/server/admin";
import { newShareId, shareUrl } from "@/lib/server/metrics";
import { expectObject, str, optNum } from "@/lib/server/validate";
import { handler, json, readJson } from "@/lib/server/http";

export const GET = handler(async (req: Request) => {
  await requireAdmin(req);
  const shares = await getStore().listMetricShares();
  return json(shares.map((s) => ({ ...s, url: shareUrl(req, s.id) })));
});

export const POST = handler(async (req: Request) => {
  await requireAdmin(req);
  const b = expectObject(await readJson<unknown>(req), "share");
  const label = str(b.label, "label", { min: 1, max: 80 });
  const days = optNum(b.expiresInDays, "expiresInDays", { min: 1, max: 3650, integer: true });
  const expiresAt = days ? new Date(Date.now() + days * 86_400_000).toISOString() : null;
  const share = await getStore().createMetricShare(newShareId(), label, expiresAt);
  return json({ ...share, url: shareUrl(req, share.id) }, 201);
});
