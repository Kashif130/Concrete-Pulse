import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchConcretePools, fetchPoolChart } from "@/lib/llama";
import { StatCard } from "@/components/StatCard";
import { PoolHistoryChart } from "@/components/PoolHistoryChart";
import { StabilityBadge } from "@/components/StabilityBadge";
import { apyStability } from "@/lib/stability";
import { fmtPct, fmtUsdShort } from "@/lib/format";

export const revalidate = 1800;

export default async function PoolDetailPage({ params }: { params: { poolId: string } }) {
  const pools = await fetchConcretePools().catch(() => null);
  const pool = pools?.find((p) => p.pool === params.poolId);

  if (pools !== null && !pool) {
    // Scoped to Concrete's own pools — this dashboard's purpose, not a general DefiLlama pool explorer.
    notFound();
  }

  const chartResult = await fetchPoolChart(params.poolId).catch(() => null);

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 md:px-8">
      <Link href="/status" className="focus-ring text-xs text-inkfaint underline-offset-2 hover:text-pulse hover:underline">
        ← Back to status
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-semibold">{pool?.symbol ?? "Pool"}</h1>
        {pool && <StabilityBadge stability={apyStability(pool)} />}
      </div>
      {pool && <p className="mt-1 text-sm text-inkfaint">{pool.chain} · pool id {pool.pool}</p>}

      {pool && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Current TVL" value={fmtUsdShort(pool.tvlUsd)} />
          <StatCard label="Current APY" value={fmtPct(pool.apy)} accent="text-amber" />
          <StatCard label="Base APY" value={fmtPct(pool.apyBase)} accent="text-steel" />
          <StatCard label="30d mean APY" value={fmtPct(pool.apyMean30d)} />
        </div>
      )}

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold">History</h2>
        <div className="mt-3 border border-line/15 bg-paper/5 p-4">
          {chartResult ? (
            <PoolHistoryChart points={chartResult} />
          ) : (
            <p className="py-12 text-center text-sm text-rust">Couldn't load history for this pool right now.</p>
          )}
        </div>
      </section>
    </div>
  );
}
