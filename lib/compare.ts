import type { LlamaPool } from "./llama";

export type CanonicalAsset = "USDC" | "USDT" | "WETH" | "WBTC" | "USD1";

const ASSET_PATTERNS: [CanonicalAsset, RegExp][] = [
  ["USDC", /usdc/i],
  ["USDT", /usdt/i],
  ["USD1", /usd1/i],
  ["WETH", /w?eth\b/i],
  ["WBTC", /w?btc/i],
];

/** Maps a pool's raw symbol to one of the canonical assets we compare on, or null if it doesn't match
 * cleanly (e.g. a multi-token LP symbol like "USDC-ETH") — those are excluded rather than mis-bucketed. */
export function canonicalAsset(symbol: string): CanonicalAsset | null {
  // Multi-token LP symbols contain a separator; single-asset lending/vault positions don't.
  if (/[-/]/.test(symbol)) return null;
  for (const [asset, pattern] of ASSET_PATTERNS) {
    if (pattern.test(symbol)) return asset;
  }
  return null;
}

export interface ComparisonRow {
  asset: CanonicalAsset;
  project: string;
  apy: number;
  tvlUsd: number;
  isConcrete: boolean;
  poolId: string;
}

const MIN_TVL_FOR_COMPARISON = 250_000;

/** For each (project, asset) pair, keeps the single highest-APY, single-exposure pool with meaningful TVL —
 * the same "best rate you could actually get" comparison a rate-shopping user would want, not every pool. */
export function buildComparisonRows(concretePools: LlamaPool[], comparisonPools: LlamaPool[]): ComparisonRow[] {
  const best = new Map<string, ComparisonRow>();

  const consider = (pools: LlamaPool[], isConcrete: boolean) => {
    for (const p of pools) {
      if (p.exposure !== "single") continue;
      if (p.tvlUsd < MIN_TVL_FOR_COMPARISON) continue;
      if (p.apy === null || p.apy <= 0 || p.apy > 100) continue; // guard against bad/incentive-inflated outliers
      const asset = canonicalAsset(p.symbol);
      if (!asset) continue;

      const key = `${p.project}::${asset}`;
      const existing = best.get(key);
      if (!existing || p.apy > existing.apy) {
        best.set(key, { asset, project: p.project, apy: p.apy, tvlUsd: p.tvlUsd, isConcrete, poolId: p.pool });
      }
    }
  };

  consider(comparisonPools, false);
  consider(concretePools, true);

  return [...best.values()].sort((a, b) => a.asset.localeCompare(b.asset) || b.apy - a.apy);
}
