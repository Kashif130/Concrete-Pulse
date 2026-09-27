// Thin wrappers around DefiLlama's public, key-free APIs. Both are official, documented endpoints
// (docs.llama.fi) that the DefiLlama frontend itself uses — no auth, no rate-limit key needed for this
// volume of traffic. Server-only: these run inside Route Handlers, never in the browser.

export const CONCRETE_SLUG = "concrete";

// Ethereum-chain lending markets close enough to Concrete's own stablecoin/BTC/ETH vaults to be a fair
// side-by-side comparison. Extend this list if Concrete adds a vault in a new asset class.
export const COMPARISON_PROJECTS = [
  { slug: "aave-v3", label: "Aave v3" },
  { slug: "compound-v3", label: "Compound v3" },
  { slug: "morpho-blue", label: "Morpho Blue" },
  { slug: "spark", label: "Spark" },
  { slug: "sky-lending", label: "Sky (ex-MakerDAO)" },
  { slug: "euler-v2", label: "Euler v2" },
  { slug: "fluid-lending", label: "Fluid" },
] as const;

export type ComparisonSlug = (typeof COMPARISON_PROJECTS)[number]["slug"];

export interface LlamaPool {
  pool: string;
  project: string;
  symbol: string;
  chain: string;
  tvlUsd: number;
  apy: number | null;
  apyBase: number | null;
  apyReward: number | null;
  apyMean30d: number | null;
  apyPct1D: number | null;
  apyPct7D: number | null;
  apyPct30D: number | null;
  stablecoin: boolean;
  ilRisk: "yes" | "no" | string;
  exposure: "single" | "multi" | string;
}

interface LlamaPoolsResponse {
  status: string;
  data: LlamaPool[];
}

export interface LlamaProtocolTvlPoint {
  date: number; // unix seconds
  totalLiquidityUSD: number;
}

export interface LlamaProtocolResponse {
  name: string;
  tvl: LlamaProtocolTvlPoint[];
  chainTvls: Record<string, { tvl: LlamaProtocolTvlPoint[] }>;
  currentChainTvls?: Record<string, number>;
}

// A single pool's own APY/TVL history — DefiLlama's per-pool chart endpoint (distinct from the protocol-
// wide TVL history above). timestamp is an ISO-8601 string here, not unix seconds.
export interface LlamaPoolChartPoint {
  timestamp: string;
  tvlUsd: number;
  apy: number | null;
  apyBase: number | null;
  apyReward: number | null;
}

interface LlamaPoolChartResponse {
  status: string;
  data: LlamaPoolChartPoint[];
}

async function fetchJson<T>(url: string, revalidateSeconds: number): Promise<T> {
  const res = await fetch(url, {
    headers: { accept: "application/json" },
    next: { revalidate: revalidateSeconds },
  });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return (await res.json()) as T;
}

/**
 * The raw /pools endpoint returns 20,000+ rows in one response (DefiLlama's own recommended pattern —
 * there's no server-side filter param on the public endpoint). We fetch once per revalidation window and
 * filter down to the projects we care about before this ever reaches a client.
 */
export async function fetchAllPools(): Promise<LlamaPool[]> {
  const json = await fetchJson<LlamaPoolsResponse>("https://yields.llama.fi/pools", 300);
  if (json.status !== "success" || !Array.isArray(json.data)) {
    throw new Error("Unexpected response shape from yields.llama.fi/pools");
  }
  return json.data;
}

export async function fetchConcretePools(): Promise<LlamaPool[]> {
  const all = await fetchAllPools();
  return all.filter((p) => p.project === CONCRETE_SLUG);
}

export async function fetchComparisonPools(): Promise<LlamaPool[]> {
  const wanted = new Set(COMPARISON_PROJECTS.map((p) => p.slug) as string[]);
  const all = await fetchAllPools();
  return all.filter((p) => wanted.has(p.project) && p.chain === "Ethereum");
}

export async function fetchConcreteProtocol(): Promise<LlamaProtocolResponse> {
  return fetchJson<LlamaProtocolResponse>(`https://api.llama.fi/protocol/${CONCRETE_SLUG}`, 900);
}

/**
 * Per-pool APY/TVL history. Cached longer (30 min) than the live pool list — historical daily points don't
 * need minute-level freshness, and this endpoint gets called once per pool shown (a detail page, or a
 * trend chart across several pools), so a longer window keeps upstream call volume reasonable.
 */
export async function fetchPoolChart(poolId: string): Promise<LlamaPoolChartPoint[]> {
  const json = await fetchJson<LlamaPoolChartResponse>(`https://yields.llama.fi/chart/${poolId}`, 1800);
  if (json.status !== "success" || !Array.isArray(json.data)) {
    throw new Error(`Unexpected response shape from yields.llama.fi/chart/${poolId}`);
  }
  return json.data;
}
