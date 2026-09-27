import { NextResponse } from "next/server";
import { fetchConcreteProtocol } from "@/lib/llama";

export const revalidate = 900; // 15 min — matches the upstream fetch's own revalidate window

export async function GET() {
  try {
    const protocol = await fetchConcreteProtocol();

    // Trim to daily points over the last 180 days so the client never has to parse years of history it
    // won't render, and dedupe same-day points (DefiLlama sometimes has more than one per day).
    const cutoff = Date.now() / 1000 - 180 * 24 * 60 * 60;
    const seenDays = new Set<string>();
    const tvl = protocol.tvl
      .filter((p) => p.date >= cutoff)
      .filter((p) => {
        const day = new Date(p.date * 1000).toISOString().slice(0, 10);
        if (seenDays.has(day)) return false;
        seenDays.add(day);
        return true;
      })
      .sort((a, b) => a.date - b.date);

    const chainBreakdown = Object.entries(protocol.currentChainTvls ?? {})
      .filter(([, v]) => typeof v === "number" && v > 0)
      .sort((a, b) => b[1] - a[1]);

    return NextResponse.json({
      name: protocol.name,
      tvl,
      chainBreakdown,
      latestTvl: tvl.length > 0 ? tvl[tvl.length - 1].totalLiquidityUSD : null,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch Concrete protocol data." },
      { status: 502 }
    );
  }
}
