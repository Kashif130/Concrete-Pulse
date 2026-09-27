"use client";

import { AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { fmtUsdShort, fmtPct } from "@/lib/format";
import type { LlamaPoolChartPoint } from "@/lib/llama";

function fmtChartDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

export function PoolHistoryChart({ points }: { points: LlamaPoolChartPoint[] }) {
  const data = points
    .filter((p) => p.apy !== null)
    .map((p) => ({ ts: p.timestamp, tvl: p.tvlUsd, apy: p.apy as number }));

  if (data.length < 2) {
    return <p className="py-12 text-center text-sm text-inkfaint">Not enough history yet to chart this pool.</p>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <p className="mb-2 text-xs uppercase tracking-wide text-inkfaint">TVL</p>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="poolTvlFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7CFF6B" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#7CFF6B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#DAD6CB" strokeOpacity={0.08} vertical={false} />
            <XAxis dataKey="ts" tickFormatter={fmtChartDate} stroke="#6B675C" tick={{ fontSize: 11 }} minTickGap={40} />
            <YAxis tickFormatter={fmtUsdShort} stroke="#6B675C" tick={{ fontSize: 11 }} width={56} />
            <Tooltip
              contentStyle={{ background: "#0E1210", border: "1px solid #2A2820", fontSize: 12 }}
              labelFormatter={(v) => fmtChartDate(v as string)}
              formatter={(v: number) => [fmtUsdShort(v), "TVL"]}
            />
            <Area type="monotone" dataKey="tvl" stroke="#7CFF6B" strokeWidth={2} fill="url(#poolTvlFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div>
        <p className="mb-2 text-xs uppercase tracking-wide text-inkfaint">APY</p>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#DAD6CB" strokeOpacity={0.08} vertical={false} />
            <XAxis dataKey="ts" tickFormatter={fmtChartDate} stroke="#6B675C" tick={{ fontSize: 11 }} minTickGap={40} />
            <YAxis tickFormatter={(v) => `${v}%`} stroke="#6B675C" tick={{ fontSize: 11 }} width={48} />
            <Tooltip
              contentStyle={{ background: "#0E1210", border: "1px solid #2A2820", fontSize: 12 }}
              labelFormatter={(v) => fmtChartDate(v as string)}
              formatter={(v: number) => [fmtPct(v), "APY"]}
            />
            <Line type="monotone" dataKey="apy" stroke="#E8A33D" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
