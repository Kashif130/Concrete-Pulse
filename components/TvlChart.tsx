"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { fmtDate, fmtUsdShort } from "@/lib/format";
import type { LlamaProtocolTvlPoint } from "@/lib/llama";

export function TvlChart({ points }: { points: LlamaProtocolTvlPoint[] }) {
  const data = points.map((p) => ({ date: p.date, tvl: p.totalLiquidityUSD }));

  if (data.length < 2) {
    return <p className="py-12 text-center text-sm text-inkfaint">Not enough history yet to chart.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="tvlFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7CFF6B" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#7CFF6B" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#DAD6CB" strokeOpacity={0.08} vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={fmtDate}
          stroke="#6B675C"
          tick={{ fontSize: 11 }}
          minTickGap={40}
        />
        <YAxis tickFormatter={fmtUsdShort} stroke="#6B675C" tick={{ fontSize: 11 }} width={56} />
        <Tooltip
          contentStyle={{ background: "#0E1210", border: "1px solid #2A2820", fontSize: 12 }}
          labelFormatter={(v) => fmtDate(v as number)}
          formatter={(v: number) => [fmtUsdShort(v), "TVL"]}
        />
        <Area type="monotone" dataKey="tvl" stroke="#7CFF6B" strokeWidth={2} fill="url(#tvlFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
