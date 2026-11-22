// Polygon facts for in-app payments, shared by browser and server. Bolivia's
// bank-QR route (Pollar's ramp) delivers USDC on Polygon in ONE step — no
// bridge, no extra wallet to set up, nothing to approve — so that is where a
// guest pays a host: bank QR → USDC in the guest's Polygon wallet → the host's.

import { STELLAR_NETWORK } from "@/lib/stellar";

const MAINNET = STELLAR_NETWORK === "mainnet";

/** Circle's native USDC on Polygon (Amoy on testnet). 6 decimals. */
export const POLYGON_USDC = MAINNET
  ? "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359"
  : "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582";
export const USDC_DECIMALS = 6;

/** Public JSON-RPC endpoints, tried in order (reads only; all allow browsers). */
const RPCS = MAINNET
  ? ["https://polygon-bor-rpc.publicnode.com", "https://polygon-rpc.com", "https://polygon.drpc.org"]
  : ["https://polygon-amoy-bor-rpc.publicnode.com", "https://rpc-amoy.polygon.technology"];

const EVM_ADDRESS = /^0x[0-9a-fA-F]{40}$/;

/** An EVM account ("0x…", 40 hex). Shape only. */
export function isEvmAddress(v: unknown): v is string {
  return typeof v === "string" && EVM_ADDRESS.test(v);
}

export const sameEvmAddress = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

/** One JSON-RPC read; the next endpoint answers when one is down. */
export async function polygonRpc<T>(method: string, params: unknown[], signal?: AbortSignal): Promise<T> {
  let last: unknown = new Error("No Polygon RPC configured");
  for (const url of RPCS) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
        cache: "no-store",
        signal: signal ?? AbortSignal.timeout(10_000),
      });
      if (!res.ok) throw new Error(`Polygon RPC answered ${res.status}`);
      const body = (await res.json()) as { result?: T; error?: { message?: string } };
      if (body.error) throw new Error(body.error.message || "Polygon RPC error");
      return body.result as T;
    } catch (e) {
      if (signal?.aborted) throw e;
      last = e;
    }
  }
  throw last;
}

/** Base units (integer string, 6 decimals) → "2.914238". */
export function fromUsdcUnits(units: bigint): string {
  const base = BigInt(10) ** BigInt(USDC_DECIMALS);
  return `${units / base}.${(units % base).toString().padStart(USDC_DECIMALS, "0")}`;
}

/** 2.914238 → "2914238" (never more than the 6 decimals USDC has). */
export function toUsdcUnits(amount: number): string {
  // Rounded, not floored: 2.914238 * 1e6 is 2914237.9999… in floating point.
  return BigInt(Math.round(amount * 10 ** USDC_DECIMALS)).toString();
}

/** An account's USDC on Polygon. Null when the network couldn't be asked. */
export async function polygonUsdcBalance(address: string, signal?: AbortSignal): Promise<number | null> {
  try {
    // balanceOf(address)
    const data = `0x70a08231${address.slice(2).toLowerCase().padStart(64, "0")}`;
    const hex = await polygonRpc<string>("eth_call", [{ to: POLYGON_USDC, data }, "latest"], signal);
    return Number(fromUsdcUnits(BigInt(hex && hex !== "0x" ? hex : "0x0")));
  } catch {
    return null;
  }
}

export function polygonTxUrl(hash: string): string {
  return `https://${MAINNET ? "" : "amoy."}polygonscan.com/tx/${hash}`;
}
