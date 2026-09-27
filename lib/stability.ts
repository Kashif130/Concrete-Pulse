// Derives a simple "how steady is this rate" signal from fields DefiLlama already returns on every pool
// (apyPct7D, apyMean30d) — no extra API calls needed.

export type ApyStability = "steady" | "moderate" | "volatile";

export const STABILITY_LABEL: Record<ApyStability, string> = {
  steady: "Steady",
  moderate: "Moderate",
  volatile: "Volatile",
};

/**
 * Primary signal: apyPct7D, DefiLlama's own percentage-point change in APY over the trailing 7 days — a
 * direct volatility read. Falls back to how far the current APY sits from its own 30-day mean when 7d
 * change isn't available (some pools are too new to have one).
 */
export function apyStability(pool: {
  apy: number | null;
  apyMean30d: number | null;
  apyPct7D: number | null;
}): ApyStability | null {
  if (pool.apy === null) return null;

  if (pool.apyPct7D !== null && !Number.isNaN(pool.apyPct7D)) {
    const swing = Math.abs(pool.apyPct7D);
    if (swing < 1) return "steady";
    if (swing < 3) return "moderate";
    return "volatile";
  }

  if (pool.apyMean30d !== null && pool.apyMean30d > 0) {
    const deviation = Math.abs(pool.apy - pool.apyMean30d) / pool.apyMean30d;
    if (deviation < 0.15) return "steady";
    if (deviation < 0.4) return "moderate";
    return "volatile";
  }

  return null;
}
