# Concrete Pulse

Status, on-chain analytics, and DeFi rate comparison for the Concrete ecosystem — unofficial, community-built.
Not affiliated with or endorsed by Blueprint Finance / Concrete.

Three tools in one Next.js app:

- **`/status`** — per-vault health (TVL present? APY reporting?) based on DefiLlama's live pool data.
- **`/analytics`** — TVL history, chain breakdown, and risk mix for every Concrete vault DefiLlama tracks.
- **`/compare`** — Concrete's best rate per asset (USDC, USDT, WETH, WBTC, USD1) next to Aave v3, Compound v3,
  Morpho Blue, Spark, and Sky.

## Data source

Everything comes from DefiLlama's public, key-free APIs:

- `https://yields.llama.fi/pools` — pool-level TVL/APY for Concrete and the comparison protocols.
- `https://api.llama.fi/protocol/concrete` — Concrete's protocol-level TVL history and chain breakdown.

No API key, no wallet connection, no RPC provider needed. `lib/llama.ts` fetches and caches both (via Next's
`fetch` + `revalidate`); `app/api/llama/*` exposes trimmed, cached versions if you want to hit them from a
client component or another tool.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Deploy to Vercel

No environment variables are required — every data source is public. Just:

```bash
vercel
```

or connect the repo in the Vercel dashboard and deploy. Framework preset: Next.js (auto-detected).

## Extending it

- **More comparison protocols**: add an entry to `COMPARISON_PROJECTS` in `lib/llama.ts` (use the project's
  DefiLlama slug — check `https://defillama.com/protocol/<slug>`).
- **More assets on `/compare`**: add a pattern to `ASSET_PATTERNS` in `lib/compare.ts`.
- **Different status thresholds**: `poolStatus()` in `app/status/page.tsx` is intentionally simple (TVL > 0,
  APY reported) — tighten it if you get access to a better freshness signal than DefiLlama's snapshot.
