"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import type { TrendPoint } from "@/lib/market-trend";
import { fmtPct } from "@/lib/format";

function fmtTrendDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

export function CompareTrendChart({ points }: { points: TrendPoint[] }) {
  const hasData = points.some((p) => p.concreteApy !== null || p.marketApy !== null);

  if (!hasData) {
    return <p className="py-8 text-center text-sm text-inkfaint">Not enough history yet to trend this.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={points} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="#DAD6CB" strokeOpacity={0.08} vertical={false} />
        <XAxis dataKey="date" tickFormatter={fmtTrendDate} stroke="#6B675C" tick={{ fontSize: 11 }} minTickGap={40} />
        <YAxis tickFormatter={(v) => `${v}%`} stroke="#6B675C" tick={{ fontSize: 11 }} width={48} />
        <Tooltip
          contentStyle={{ background: "#0E1210", border: "1px solid #2A2820", fontSize: 12 }}
          labelFormatter={(v) => fmtTrendDate(v as string)}
          formatter={(v: number, name: string) => [fmtPct(v), name]}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="concreteApy" name="Concrete" stroke="#7CFF6B" strokeWidth={2} dot={false} connectNulls />
        <Line type="monotone" dataKey="marketApy" name="Comparison protocols" stroke="#5B9DF7" strokeWidth={2} dot={false} connectNulls />
      </LineChart>
    </ResponsiveContainer>
  );
}
