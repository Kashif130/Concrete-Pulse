"use client";

import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { ComparisonRow } from "@/lib/compare";
import { fmtPct } from "@/lib/format";
import { PROJECT_COLORS, PROJECT_LABELS } from "@/lib/projects";

export function CompareBarChart({ rows, asset }: { rows: ComparisonRow[]; asset: string }) {
  const filtered = rows
    .filter((r) => r.asset === asset)
    .sort((a, b) => b.apy - a.apy)
    .map((r) => ({ project: PROJECT_LABELS[r.project] ?? r.project, apy: r.apy, fill: PROJECT_COLORS[r.project] ?? "#9A968A" }));

  if (filtered.length === 0) {
    return <p className="py-8 text-center text-sm text-inkfaint">No comparable {asset} pools right now.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(120, filtered.length * 44)}>
      <BarChart data={filtered} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 4 }}>
        <CartesianGrid stroke="#DAD6CB" strokeOpacity={0.08} horizontal={false} />
        <XAxis type="number" tickFormatter={(v) => `${v}%`} stroke="#6B675C" tick={{ fontSize: 11 }} />
        <YAxis type="category" dataKey="project" stroke="#6B675C" tick={{ fontSize: 12 }} width={100} />
        <Tooltip
          contentStyle={{ background: "#0E1210", border: "1px solid #2A2820", fontSize: 12 }}
          formatter={(v: number) => [fmtPct(v), "APY"]}
        />
        <Bar dataKey="apy" radius={[0, 4, 4, 0]}>
          {filtered.map((entry, i) => (
            <Cell key={i} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
