import { fetchConcretePools, fetchComparisonPools, fetchAllPools, COMPARISON_PROJECTS } from "@/lib/llama";
import { buildComparisonRows, type CanonicalAsset } from "@/lib/compare";
import { buildMarketBenchmark } from "@/lib/market";
import { buildCompareTrend } from "@/lib/market-trend";
import { CompareBarChart } from "@/components/CompareBarChart";
import { CompareTrendChart } from "@/components/CompareTrendChart";
import { MarketBenchmarkPanel } from "@/components/MarketBenchmarkPanel";
import { ExportButtons } from "@/components/ExportButtons";
import { PROJECT_LABELS } from "@/lib/projects";
import { fmtPct, fmtUsdShort } from "@/lib/format";

export const revalidate = 300;

const ASSETS: CanonicalAsset[] = ["USDC", "USDT", "WETH", "WBTC", "USD1"];

export default async function ComparePage() {
  const [concreteResult, comparisonResult, allPoolsResult] = await Promise.allSettled([
    fetchConcretePools(),
    fetchComparisonPools(),
    fetchAllPools(),
  ]);

  if (concreteResult.status === "rejected" || comparisonResult.status === "rejected") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-14 md:px-8">
        <h1 className="font-display text-2xl font-semibold">Compare</h1>
        <p className="mt-3 text-sm text-rust">Couldn't reach DefiLlama right now. Try again shortly.</p>
      </div>
    );
  }

  const rows = buildComparisonRows(concreteResult.value, comparisonResult.value);
  const assetsWithData = ASSETS.filter((a) => rows.some((r) => r.asset === a));
  const marketBuckets = allPoolsResult.status === "fulfilled" ? buildMarketBenchmark(allPoolsResult.value) : [];
  const trendPoints = await buildCompareTrend(rows);

  const exportRows = rows.map((r) => ({
    asset: r.asset,
    project: r.isConcrete ? "Concrete" : PROJECT_LABELS[r.project] ?? r.project,
    apy: r.apy,
    tvlUsd: r.tvlUsd,
    isConcrete: r.isConcrete,
    poolId: r.poolId,
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 md:px-8">
      <h1 className="font-display text-3xl font-semibold">Rate comparison</h1>
      <p className="mt-2 max-w-2xl text-sm text-inkfaint">
        Concrete's best reported APY per asset, next to {COMPARISON_PROJECTS.map((p) => p.label).join(", ")} on
        Ethereum — single-asset pools only, filtered to at least $250K TVL, so incentive-inflated dust pools
        don't skew the picture.
      </p>

      {marketBuckets.length > 0 && (
        <div className="mt-10">
          <MarketBenchmarkPanel buckets={marketBuckets} />
        </div>
      )}

      <section className="mt-14">
        <h2 className="font-display text-xl font-semibold">30-day trend</h2>
        <p className="mt-2 max-w-2xl text-sm text-inkfaint">
          Concrete's average reported APY vs. the comparison protocols', from each pool's own history —
          unweighted daily average across the same best-pool-per-asset rows shown below, not a precise
          historical snapshot. Useful for spotting whether the gap is widening or narrowing.
        </p>
        <div className="mt-4 border border-line/15 bg-paper/5 p-4">
          <CompareTrendChart points={trendPoints} />
        </div>
      </section>

      <div className="mt-8 flex items-center justify-between gap-2">
        <h2 className="font-display text-xl font-semibold">By protocol, by asset</h2>
        <ExportButtons data={exportRows} filenameBase="concrete-pulse-compare" />
      </div>

      {assetsWithData.length === 0 && (
        <p className="mt-4 text-sm text-inkfaint">No comparable pools found across these assets right now.</p>
      )}

      <div className="mt-6 space-y-10">
        {assetsWithData.map((asset) => {
          const assetRows = rows.filter((r) => r.asset === asset).sort((a, b) => b.apy - a.apy);
          const concreteRow = assetRows.find((r) => r.isConcrete);
          const bestOther = assetRows.find((r) => !r.isConcrete);
          return (
            <section key={asset}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-display text-xl font-semibold">{asset}</h2>
                {concreteRow && bestOther && (
                  <p className="text-xs text-inkfaint">
                    Concrete is{" "}
                    <span className={concreteRow.apy >= bestOther.apy ? "text-pulse" : "text-rust"}>
                      {(concreteRow.apy - bestOther.apy).toFixed(2)} pts
                    </span>{" "}
                    vs. the best of the rest ({bestOther.project})
                  </p>
                )}
              </div>
              <div className="mt-3 border border-line/15 bg-paper/5 p-4">
                <CompareBarChart rows={rows} asset={asset} />
              </div>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[420px] text-left text-xs">
                  <thead className="text-inkfaint">
                    <tr>
                      <th className="py-1 pr-4">Protocol</th>
                      <th className="py-1 pr-4">APY</th>
                      <th className="py-1">Pool TVL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assetRows.map((r) => (
                      <tr key={r.project} className="border-t border-line/10">
                        <td className={`py-1.5 pr-4 font-medium ${r.isConcrete ? "text-pulse" : "text-paper"}`}>
                          {r.isConcrete ? "Concrete" : PROJECT_LABELS[r.project] ?? r.project}
                        </td>
                        <td className="py-1.5 pr-4 font-mono">{fmtPct(r.apy)}</td>
                        <td className="py-1.5 font-mono text-inkfaint">{fmtUsdShort(r.tvlUsd)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </div>

      <p className="mt-10 border-t border-line/15 pt-4 text-xs text-inkfaint">
        APY figures are point-in-time and move constantly — treat this as a starting point for research, not
        financial advice. "Best" pool per protocol only; each protocol may have lower-yield pools for the same
        asset (different risk parameters, chains, or collateral requirements).
      </p>
    </div>
  );
}
