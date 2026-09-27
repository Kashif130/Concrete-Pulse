import type { ComparisonRow } from "./compare";
import { fetchPoolChart } from "./llama";

export interface TrendPoint {
  date: string; // YYYY-MM-DD
  concreteApy: number | null;
  marketApy: number | null;
}

function dayKey(isoTimestamp: string): string {
  return isoTimestamp.slice(0, 10);
}

function average(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return nums.reduce((sum, n) => sum + n, 0) / nums.length;
}

/**
 * 30-day trend of Concrete's rate vs. the comparison protocols', built from each row's own per-pool
 * history (DefiLlama's /chart endpoint) — the same best-pool-per-asset set shown in the table above, not
 * a separate dataset. This is an unweighted daily average across those rows, not TVL-weighted: the public
 * chart endpoint gives each pool its own independent history with its own date range, so there's no clean
 * way to align daily TVL across pools the way the live snapshot in the panel above can. Treat it as
 * directional (is the gap widening or narrowing), not a precise historical rate.
 */
export async function buildCompareTrend(rows: ComparisonRow[], days = 30): Promise<TrendPoint[]> {
  if (rows.length === 0) return [];

  const results = await Promise.allSettled(rows.map((r) => fetchPoolChart(r.poolId)));
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

  const byDay = new Map<string, { concrete: number[]; market: number[] }>();

  results.forEach((res, i) => {
    if (res.status !== "fulfilled") return;
    const isConcrete = rows[i].isConcrete;
    for (const point of res.value) {
      if (point.apy === null) continue;
      const t = new Date(point.timestamp).getTime();
      if (Number.isNaN(t) || t < cutoff) continue;

      const key = dayKey(point.timestamp);
      if (!byDay.has(key)) byDay.set(key, { concrete: [], market: [] });
      byDay.get(key)![isConcrete ? "concrete" : "market"].push(point.apy);
    }
  });

  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, { concrete, market }]) => ({
      date,
      concreteApy: average(concrete),
      marketApy: average(market),
    }));
}
