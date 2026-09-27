import Link from "next/link";
import { fetchConcreteProtocol, fetchConcretePools } from "@/lib/llama";
import { StatCard } from "@/components/StatCard";
import { fmtUsdShort, fmtPct } from "@/lib/format";

export const revalidate = 900;

export default async function HomePage() {
  const [protocol, pools] = await Promise.allSettled([fetchConcreteProtocol(), fetchConcretePools()]);

  const latestTvl =
    protocol.status === "fulfilled" && protocol.value.tvl.length > 0
      ? protocol.value.tvl[protocol.value.tvl.length - 1].totalLiquidityUSD
      : null;

  const poolCount = pools.status === "fulfilled" ? pools.value.length : null;
  const avgApy =
    pools.status === "fulfilled" && pools.value.length > 0
      ? pools.value.reduce((sum, p) => sum + (p.apy ?? 0), 0) / pools.value.length
      : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 md:px-8">
      <p className="font-mono text-xs uppercase tracking-widest text-pulse">Concrete Pulse</p>
      <h1 className="mt-2 max-w-2xl font-display text-4xl font-semibold leading-tight md:text-5xl">
        Status, analytics, and rate comparison for Concrete — in one place.
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-inkfaint">
        An independent, always-on dashboard for the Concrete ecosystem (app.concrete.xyz, blueprint.finance),
        built on DefiLlama's public data. No wallet, no login, no API key.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Protocol TVL" value={latestTvl !== null ? fmtUsdShort(latestTvl) : "—"} />
        <StatCard label="Tracked pools" value={poolCount !== null ? String(poolCount) : "—"} />
        <StatCard label="Avg. pool APY" value={fmtPct(avgApy)} accent="text-amber" />
        <StatCard label="Data source" value="DefiLlama" accent="text-steel" sub="public API" />
      </div>

      <div className="mt-12 grid gap-4 md:grid-cols-3">
        <ToolCard
          href="/status"
          title="Status"
          desc="Per-vault health at a glance — is TVL live, is APY reporting, when did each pool last update."
        />
        <ToolCard
          href="/analytics"
          title="Analytics"
          desc="TVL history, chain breakdown, and risk mix across every Concrete vault DefiLlama tracks."
        />
        <ToolCard
          href="/compare"
          title="Compare"
          desc="Concrete vs. Aave, Compound, Morpho, Spark, Sky, Euler and Fluid by asset — plus a TVL-weighted benchmark against the whole DeFi market."
        />
      </div>
    </div>
  );
}

function ToolCard({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link
      href={href}
      className="focus-ring group block border border-line/15 bg-paper/5 p-5 transition-colors hover:border-pulse/40 hover:bg-paper/10"
    >
      <h2 className="font-display text-lg font-semibold text-paper group-hover:text-pulse">{title} →</h2>
      <p className="mt-2 text-sm leading-relaxed text-inkfaint">{desc}</p>
    </Link>
  );
}
