import { CONCRETE_SLUG, type LlamaPool } from "./llama";
import { canonicalAsset, type CanonicalAsset } from "./compare";

export type AssetClass = "stablecoin" | "major";

const ASSET_CLASS: Record<CanonicalAsset, AssetClass> = {
  USDC: "stablecoin",
  USDT: "stablecoin",
  USD1: "stablecoin",
  WETH: "major",
  WBTC: "major",
};

// A wider net than the curated per-protocol table: any single-asset Ethereum pool in our tracked assets,
// from ANY project DefiLlama indexes — not just the handful we name-check in COMPARISON_PROJECTS. This is
// what makes it a real "Concrete vs the market" number instead of "Concrete vs 7 protocols we picked."
const MIN_TVL_FOR_MARKET = 1_000_000;
const MAX_SANE_APY = 50; // guard against incentive-farm/bad-data outliers dominating a TVL-weighted average

export interface MarketBenchmarkBucket {
  assetClass: AssetClass;
  concreteApy: number | null; // TVL-weighted average across Concrete's own pools in this bucket
  concreteTvl: number;
  marketApy: number | null; // TVL-weighted average across every other eligible Ethereum pool
  marketTvl: number;
  marketPoolCount: number;
  marketProtocolCount: number;
}

function tvlWeightedApy(pools: { apy: number | null; tvlUsd: number }[]): number | null {
  const withApy = pools.filter((p): p is { apy: number; tvlUsd: number } => p.apy !== null);
  const totalTvl = withApy.reduce((sum, p) => sum + p.tvlUsd, 0);
  if (totalTvl === 0) return null;
  return withApy.reduce((sum, p) => sum + p.apy * p.tvlUsd, 0) / totalTvl;
}

/**
 * Builds a real, TVL-weighted "Concrete vs the broader DeFi market" comparison from the raw pool set —
 * no curated protocol allowlist. Bucketed into stablecoins vs. majors (ETH/BTC) since blending the two
 * would produce a meaningless blended rate.
 */
export function buildMarketBenchmark(allPools: LlamaPool[]): MarketBenchmarkBucket[] {
  const eligible = allPools.filter((p) => {
    if (p.chain !== "Ethereum") return false;
    if (p.exposure !== "single") return false;
    if (p.apy === null || p.apy <= 0 || p.apy > MAX_SANE_APY) return false;
    if (p.tvlUsd < MIN_TVL_FOR_MARKET) return false;
    return canonicalAsset(p.symbol) !== null;
  });

  const buckets: AssetClass[] = ["stablecoin", "major"];

  return buckets.map((assetClass) => {
    const inBucket = eligible.filter((p) => ASSET_CLASS[canonicalAsset(p.symbol) as CanonicalAsset] === assetClass);
    const concretePools = inBucket.filter((p) => p.project === CONCRETE_SLUG);
    const marketPools = inBucket.filter((p) => p.project !== CONCRETE_SLUG);

    return {
      assetClass,
      concreteApy: tvlWeightedApy(concretePools),
      concreteTvl: concretePools.reduce((sum, p) => sum + p.tvlUsd, 0),
      marketApy: tvlWeightedApy(marketPools),
      marketTvl: marketPools.reduce((sum, p) => sum + p.tvlUsd, 0),
      marketPoolCount: marketPools.length,
      marketProtocolCount: new Set(marketPools.map((p) => p.project)).size,
    };
  });
}
