import { NextResponse } from "next/server";
import { fetchAllPools, CONCRETE_SLUG, COMPARISON_PROJECTS } from "@/lib/llama";

export const revalidate = 300;

export async function GET() {
  try {
    const all = await fetchAllPools();
    const comparisonSlugs = new Set(COMPARISON_PROJECTS.map((p) => p.slug) as string[]);

    const concrete = all
      .filter((p) => p.project === CONCRETE_SLUG)
      .sort((a, b) => b.tvlUsd - a.tvlUsd);

    const comparison = all.filter((p) => comparisonSlugs.has(p.project) && p.chain === "Ethereum");

    return NextResponse.json({ concrete, comparison, fetchedAt: Date.now() });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch pool data." },
      { status: 502 }
    );
  }
}
