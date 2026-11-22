// Reads a payment off Polygon. Like the Stellar check (lib/server/stellar),
// the server takes nobody's word that a guest paid: it reads the transaction's
// receipt and counts the USDC it moved to the host's wallet.
//
// An ERC-20 transfer carries no memo, so a payment is tied to a guest by being
// claimed once (a transaction hash pays for one spot, ever — the store refuses
// a second use) and by being recent.

import "server-only";
import { POLYGON_USDC, fromUsdcUnits, polygonRpc, sameEvmAddress } from "@/lib/polygon";
import type { VerifiedPayment } from "@/lib/server/stellar";

export const EVM_TX_HASH = /^0x[0-9a-f]{64}$/;

/** keccak256("Transfer(address,address,uint256)") */
const TRANSFER = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
/** A payment older than this can't be claimed for a spot reserved now. */
const MAX_AGE_MS = 24 * 60 * 60_000;

type Receipt = {
  status: string;
  blockNumber: string;
  logs: { address: string; topics: string[]; data: string }[];
};

/** The USDC a successful Polygon transaction paid to `to`. */
export async function verifyPolygonUsdcPayment(
  txHash: string,
  { to }: { to: string },
): Promise<VerifiedPayment> {
  const receipt = await polygonRpc<Receipt | null>("eth_getTransactionReceipt", [txHash]);
  if (!receipt) return { status: "unknown" }; // not mined (or not seen) yet
  if (receipt.status !== "0x1") return { status: "invalid", reason: "That transaction failed on the network." };

  let units = BigInt(0);
  for (const log of receipt.logs) {
    if (
      sameEvmAddress(log.address, POLYGON_USDC) &&
      log.topics[0] === TRANSFER &&
      log.topics.length === 3 &&
      sameEvmAddress(`0x${log.topics[2].slice(26)}`, to)
    )
      units += BigInt(log.data);
  }
  if (units <= BigInt(0))
    return { status: "invalid", reason: "That transaction didn't pay USDC to the host." };

  const block = await polygonRpc<{ timestamp: string } | null>("eth_getBlockByNumber", [receipt.blockNumber, false]);
  if (!block) return { status: "unknown" };
  const at = new Date(Number(BigInt(block.timestamp)) * 1000);
  if (Date.now() - at.getTime() > MAX_AGE_MS)
    return { status: "invalid", reason: "That transaction is too old to be the payment for this spot." };
  return { status: "ok", amount: fromUsdcUnits(units), at: at.toISOString() };
}
