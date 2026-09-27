import type { MarketBenchmarkBucket } from "@/lib/market";
import { fmtPct, fmtUsdShort } from "@/lib/format";

const BUCKET_LABEL: Record<MarketBenchmarkBucket["assetClass"], string> = {
  stablecoin: "Stablecoins (USDC / USDT / USD1)",
  major: "Majors (WETH / WBTC)",
};

function BucketRow({ bucket }: { bucket: MarketBenchmarkBucket }) {
  const { concreteApy, marketApy } = bucket;
  const hasBoth = concreteApy !== null && marketApy !== null;
  const delta = hasBoth ? concreteApy! - marketApy! : null;

  return (
    <div className="border border-line/15 bg-paper/5 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-base font-semibold text-paper">{BUCKET_LABEL[bucket.assetClass]}</h3>
        {delta !== null && (
          <span className={`text-xs font-medium ${delta >= 0 ? "text-pulse" : "text-rust"}`}>
            Concrete {delta >= 0 ? "+" : ""}
            {delta.toFixed(2)} pts vs. market
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-inkfaint">Concrete (TVL-weighted)</p>
          <p className="mt-1 font-display text-3xl font-semibold text-pulse">{fmtPct(concreteApy)}</p>
          <p className="mt-1 text-xs text-inkfaint">{fmtUsdShort(bucket.concreteTvl)} tracked</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-inkfaint">DeFi market (TVL-weighted)</p>
          <p className="mt-1 font-display text-3xl font-semibold text-paper">{fmtPct(marketApy)}</p>
          <p className="mt-1 text-xs text-inkfaint">
            {fmtUsdShort(bucket.marketTvl)} across {bucket.marketPoolCount} pools,{" "}
            {bucket.marketProtocolCount} protocols
          </p>
        </div>
      </div>
    </div>
  );
}

export function MarketBenchmarkPanel({ buckets }: { buckets: MarketBenchmarkBucket[] }) {
  const anyData = buckets.some((b) => b.concreteApy !== null || b.marketApy !== null);

  return (
    <section>
      <h2 className="font-display text-xl font-semibold">Concrete vs. the DeFi market</h2>
      <p className="mt-2 max-w-2xl text-sm text-inkfaint">
        Not just the 7 protocols above — this pulls every single-asset Ethereum lending pool DefiLlama
        tracks (min $1M TVL) in these assets and TVL-weights the average, so a handful of tiny pools can't
        skew it. It's the honest "what's the market actually paying" number.
      </p>

      {!anyData ? (
        <p className="mt-6 text-sm text-inkfaint">Not enough data to build a market benchmark right now.</p>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {buckets.map((b) => (
            <BucketRow key={b.assetClass} bucket={b} />
          ))}
        </div>
      )}
    </section>
  );
}
