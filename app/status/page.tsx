import Link from "next/link";
import { fetchConcretePools, fetchConcreteProtocol } from "@/lib/llama";
import { StatCard } from "@/components/StatCard";
import { StatusBadge, type Status } from "@/components/StatusBadge";
import { StabilityBadge } from "@/components/StabilityBadge";
import { ExportButtons } from "@/components/ExportButtons";
import { apyStability } from "@/lib/stability";
import { fmtPct, fmtUsdShort } from "@/lib/format";

export const revalidate = 300;

function poolStatus(tvlUsd: number, apy: number | null): Status {
  if (tvlUsd <= 0) return "stale";
  if (apy === null || apy === 0) return "watch";
  return "healthy";
}

export default async function StatusPage() {
  const [poolsResult, protocolResult] = await Promise.allSettled([fetchConcretePools(), fetchConcreteProtocol()]);

  if (poolsResult.status === "rejected") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-14 md:px-8">
        <h1 className="font-display text-2xl font-semibold">Status</h1>
        <p className="mt-3 text-sm text-rust">
          Couldn't reach DefiLlama right now: {poolsResult.reason instanceof Error ? poolsResult.reason.message : "unknown error"}
        </p>
      </div>
    );
  }

  const pools = poolsResult.value.map((p) => ({ ...p, status: poolStatus(p.tvlUsd, p.apy) }));
  const healthyCount = pools.filter((p) => p.status === "healthy").length;
  const overall: Status = pools.length === 0 ? "stale" : healthyCount / pools.length >= 0.8 ? "healthy" : healthyCount / pools.length >= 0.5 ? "watch" : "stale";

  const chainBreakdown =
    protocolResult.status === "fulfilled" ? Object.entries(protocolResult.value.currentChainTvls ?? {}) : [];

  const exportRows = pools.map((p) => ({
    symbol: p.symbol,
    chain: p.chain,
    tvlUsd: p.tvlUsd,
    apy: p.apy,
    status: p.status,
    stability: apyStability(p) ?? "",
    poolId: p.pool,
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold">Vault status</h1>
        <StatusBadge status={overall} />
      </div>
      <p className="mt-2 max-w-2xl text-sm text-inkfaint">
        Status reflects what DefiLlama currently reports for each Concrete pool — TVL present and an APY being
        reported. It's a signal to look closer, not a substitute for Concrete's own monitoring (see the
        Security & Trust info on the main Guide site).
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Pools tracked" value={String(pools.length)} />
        <StatCard label="Healthy" value={String(healthyCount)} accent="text-pulse" />
        <StatCard label="Watch" value={String(pools.filter((p) => p.status === "watch").length)} accent="text-amber" />
        <StatCard label="Stale" value={String(pools.filter((p) => p.status === "stale").length)} accent="text-rust" />
      </div>

      {chainBreakdown.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2 text-xs text-inkfaint">
          <span className="uppercase tracking-wide">Chains:</span>
          {chainBreakdown
            .filter(([, v]) => typeof v === "number" && v > 0)
            .sort((a, b) => (b[1] as number) - (a[1] as number))
            .map(([chain, tvl]) => (
              <span key={chain} className="rounded-full border border-line/20 px-2.5 py-0.5">
                {chain} · {fmtUsdShort(tvl as number)}
              </span>
            ))}
        </div>
      )}

      <div className="mt-8 overflow-x-auto border border-line/15">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-paper/5 text-xs uppercase tracking-wide text-inkfaint">
            <tr>
              <th className="px-3 py-2">Pool</th>
              <th className="px-3 py-2">Chain</th>
              <th className="px-3 py-2">TVL</th>
              <th className="px-3 py-2">APY</th>
              <th className="px-3 py-2">Stability</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {pools.map((p) => (
              <tr key={p.pool} className="border-t border-line/10">
                <td className="px-3 py-2 font-medium text-paper">
                  <Link href={`/status/${p.pool}`} className="focus-ring underline-offset-2 hover:text-pulse hover:underline">
                    {p.symbol}
                  </Link>
                </td>
                <td className="px-3 py-2 text-inkfaint">{p.chain}</td>
                <td className="px-3 py-2 font-mono text-xs text-paper/90">{fmtUsdShort(p.tvlUsd)}</td>
                <td className="px-3 py-2 font-mono text-xs text-paper/90">{fmtPct(p.apy)}</td>
                <td className="px-3 py-2">
                  <StabilityBadge stability={apyStability(p)} />
                </td>
                <td className="px-3 py-2">
                  <StatusBadge status={p.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-end">
        <ExportButtons data={exportRows} filenameBase="concrete-pulse-status" />
      </div>
    </div>
  );
}
