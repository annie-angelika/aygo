// The few Stellar facts in-app payments need, shared by browser and server:
// which network the app runs on, where its public ledger API (Horizon) lives,
// and which USDC is the real one there. Guests pay hosts in USDC; the bank-QR
// part (BOB → USDC) is Pollar's ramp, see hooks/use-qr-pay.ts.

export type StellarNet = "testnet" | "mainnet";

export const STELLAR_NETWORK: StellarNet =
  process.env.NEXT_PUBLIC_POLLAR_NETWORK === "mainnet" ? "mainnet" : "testnet";

export const HORIZON_URL =
  STELLAR_NETWORK === "mainnet"
    ? "https://horizon.stellar.org"
    : "https://horizon-testnet.stellar.org";

/** Circle's USDC on Stellar — the only asset a payment is accepted in. */
export const USDC = {
  code: "USDC",
  issuer:
    STELLAR_NETWORK === "mainnet"
      ? "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"
      : "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
} as const;

const ADDRESS = /^G[A-Z2-7]{55}$/;

/** A Stellar account id ("G…", 56 chars). Shape only — not that it exists. */
export function isStellarAddress(v: unknown): v is string {
  return typeof v === "string" && ADDRESS.test(v);
}

/**
 * An account's USDC, straight from the ledger. `trusted: false` means it can't
 * RECEIVE USDC yet (no account, or no trustline) — a payment to it would fail,
 * so both sides check first. Null when Horizon couldn't be asked.
 */
export async function usdcAccount(
  address: string,
  signal?: AbortSignal,
): Promise<{ trusted: boolean; balance: number } | null> {
  try {
    const res = await fetch(`${HORIZON_URL}/accounts/${address}`, { signal, cache: "no-store" });
    if (res.status === 404) return { trusted: false, balance: 0 };
    if (!res.ok) return null;
    const account = (await res.json()) as {
      balances?: { asset_code?: string; asset_issuer?: string; balance: string }[];
    };
    const line = account.balances?.find(
      (b) => b.asset_code === USDC.code && b.asset_issuer === USDC.issuer,
    );
    return line ? { trusted: true, balance: Number(line.balance) } : { trusted: false, balance: 0 };
  } catch {
    return null;
  }
}

/** Where anyone can look a transaction up. */
export function txExplorerUrl(hash: string): string {
  return `https://stellar.expert/explorer/${STELLAR_NETWORK === "mainnet" ? "public" : "testnet"}/tx/${hash}`;
}

/** "7.1800000" → "7.18"; keeps at least two decimals. */
export function formatUsdc(amount: string | number): string {
  const n = Number(amount);
  if (!Number.isFinite(n)) return String(amount);
  return n.toFixed(7).replace(/0+$/, "").replace(/\.(\d)?$/, (_, d) => `.${d ?? "0"}0`);
}
