import { fetchConcreteProtocol, fetchConcretePools } from "@/lib/llama";
import { StatCard } from "@/components/StatCard";
import { TvlChart } from "@/components/TvlChart";
import { ExportButtons } from "@/components/ExportButtons";
import { fmtPct, fmtUsdShort } from "@/lib/format";

export const revalidate = 900;

export default async function AnalyticsPage() {
  const [protocolResult, poolsResult] = await Promise.allSettled([fetchConcreteProtocol(), fetchConcretePools()]);

  if (protocolResult.status === "rejected" && poolsResult.status === "rejected") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-14 md:px-8">
        <h1 className="font-display text-2xl font-semibold">Analytics</h1>
        <p className="mt-3 text-sm text-rust">Couldn't reach DefiLlama right now. Try again shortly.</p>
      </div>
    );
  }

  const tvlPoints = protocolResult.status === "fulfilled" ? protocolResult.value.tvl : [];
  const latestTvl = tvlPoints.length > 0 ? tvlPoints[tvlPoints.length - 1].totalLiquidityUSD : null;
  const tvl30dAgo = tvlPoints.length > 30 ? tvlPoints[tvlPoints.length - 31].totalLiquidityUSD : null;
  const tvlChangePct = latestTvl !== null && tvl30dAgo ? ((latestTvl - tvl30dAgo) / tvl30dAgo) * 100 : null;

  const pools = poolsResult.status === "fulfilled" ? poolsResult.value : [];
  const avgApy = pools.length > 0 ? pools.reduce((s, p) => s + (p.apy ?? 0), 0) / pools.length : null;
  const stablecoinCount = pools.filter((p) => p.stablecoin).length;
  const singleExposure = pools.filter((p) => p.exposure === "single").length;

  const chainTvls =
    protocolResult.status === "fulfilled"
      ? Object.entries(protocolResult.value.currentChainTvls ?? {})
          .filter(([, v]) => typeof v === "number" && v > 0)
          .sort((a, b) => (b[1] as number) - (a[1] as number))
      : [];
  const chainTotal = chainTvls.reduce((s, [, v]) => s + (v as number), 0);

  const topVaults = [...pools].sort((a, b) => b.tvlUsd - a.tvlUsd).slice(0, 10);

  const exportRows = pools.map((p) => ({
    symbol: p.symbol,
    chain: p.chain,
    tvlUsd: p.tvlUsd,
    apy: p.apy,
    apyBase: p.apyBase,
    apyReward: p.apyReward,
    stablecoin: p.stablecoin ? "yes" : "no",
    exposure: p.exposure,
    poolId: p.pool,
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 md:px-8">
      <h1 className="font-display text-3xl font-semibold">On-chain analytics</h1>
      <p className="mt-2 max-w-2xl text-sm text-inkfaint">
        Protocol-wide numbers for Concrete, sourced from DefiLlama — the same figures cited across the DeFi
        data ecosystem, not a private estimate.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total TVL" value={latestTvl !== null ? fmtUsdShort(latestTvl) : "—"} />
        <StatCard
          label="30-day change"
          value={tvlChangePct !== null ? `${tvlChangePct >= 0 ? "+" : ""}${tvlChangePct.toFixed(1)}%` : "—"}
          accent={tvlChangePct !== null && tvlChangePct < 0 ? "text-rust" : "text-pulse"}
        />
        <StatCard label="Avg. pool APY" value={fmtPct(avgApy)} accent="text-amber" />
        <StatCard label="Pools tracked" value={String(pools.length)} accent="text-steel" />
      </div>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold">TVL — last 180 days</h2>
        <div className="mt-3 border border-line/15 bg-paper/5 p-4">
          <TvlChart points={tvlPoints} />
        </div>
      </section>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <section>
          <h2 className="font-display text-lg font-semibold">TVL by chain</h2>
          <div className="mt-3 space-y-2">
            {chainTvls.map(([chain, v]) => {
              const value = v as number;
              const pct = chainTotal > 0 ? (value / chainTotal) * 100 : 0;
              return (
                <div key={chain}>
                  <div className="flex justify-between text-xs text-inkfaint">
                    <span>{chain}</span>
                    <span className="font-mono">{fmtUsdShort(value)}</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full rounded-full bg-paper/10">
                    <div className="h-1.5 rounded-full bg-pulse" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {chainTvls.length === 0 && <p className="text-sm text-inkfaint">No chain breakdown available.</p>}
          </div>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold">Risk mix (by pool count)</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between border-b border-line/10 pb-2">
              <dt className="text-inkfaint">Stablecoin pools</dt>
              <dd className="font-mono">
                {stablecoinCount} / {pools.length}
              </dd>
            </div>
            <div className="flex justify-between border-b border-line/10 pb-2">
              <dt className="text-inkfaint">Single-asset exposure</dt>
              <dd className="font-mono">
                {singleExposure} / {pools.length}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-inkfaint">Multi-asset / LP exposure</dt>
              <dd className="font-mono">{pools.length - singleExposure} / {pools.length}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="mt-10">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-lg font-semibold">Top vaults by TVL</h2>
          <ExportButtons data={exportRows} filenameBase="concrete-pulse-analytics" />
        </div>
        <div className="mt-3 overflow-x-auto border border-line/15">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="bg-paper/5 text-xs uppercase tracking-wide text-inkfaint">
              <tr>
                <th className="px-3 py-2">Pool</th>
                <th className="px-3 py-2">Chain</th>
                <th className="px-3 py-2">TVL</th>
                <th className="px-3 py-2">APY</th>
              </tr>
            </thead>
            <tbody>
              {topVaults.map((p) => (
                <tr key={p.pool} className="border-t border-line/10">
                  <td className="px-3 py-2 font-medium">{p.symbol}</td>
                  <td className="px-3 py-2 text-inkfaint">{p.chain}</td>
                  <td className="px-3 py-2 font-mono text-xs">{fmtUsdShort(p.tvlUsd)}</td>
                  <td className="px-3 py-2 font-mono text-xs">{fmtPct(p.apy)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
