// PUT /api/me/payout-wallet → { address } — "this is the wallet I get paid in".
//
// Paid events are paid in the app by bank QR, into the ORGANIZER's own wallet.
// So a host never has to find a switch: their browser reports the Polygon
// wallet their login created, and every paid event of theirs that has no
// wallet yet starts taking payments into it. It only ever touches the caller's
// own events, and never replaces a wallet an event already has.

import { getStore } from "@/lib/server/store";
import { getSessionId } from "@/lib/server/session";
import { rateLimit, LIMITS } from "@/lib/server/rate-limit";
import { expectObject, str } from "@/lib/server/validate";
import { handler, json, readJson, HttpError } from "@/lib/server/http";
import { isEvmAddress } from "@/lib/polygon";

export const PUT = handler(async (req: Request) => {
  const sid = await getSessionId();
  rateLimit(req, "host:action", sid, LIMITS.hostAction);
  const address = str(expectObject(await readJson(req), "wallet").address, "address", { max: 42 });
  if (!isEvmAddress(address)) throw new HttpError(400, "That wallet address doesn't look right.");
  return json({ events: await getStore().setPayoutWallet(sid, address) });
});
