# Implementation Order

What's already built, what running it looks like, and the order to tackle
what's left. Everything marked ✅ has been written AND verified against a
real Postgres instance + real HTTP requests (not just type-checked) — see
"Verification" at the bottom.

## Already built (this delivery)

1. ✅ **Standard schema** (`types/market.ts`) — every entity the system
   handles, exchange-agnostic.
2. ✅ **NSE adapter** — raw types, mock client (realistic synthetic data for
   17 real NSE tickers), real-client scaffold, mapper, orchestrating adapter.
3. ✅ **Adapter registry** — pluggable exchange registration, placeholder
   docs for NGX/JSE/EGX/GSE/BRVM.
4. ✅ **Ingestion** — collectors, zod validators, three pipelines (price,
   fundamentals, corporate actions) plus a fourth (candles) added during
   verification when testing surfaced it was missing.
5. ✅ **Normalization** — price rounding/derived-field consistency, canonical
   sectors, balance-sheet integrity checks, corporate-action sanity checks.
6. ✅ **Storage** — Postgres schema (`market`), repositories for every
   entity, cache abstraction (in-memory now, Redis-ready).
7. ✅ **Calculation engine** — ratios engine (PE/PB/ROE/margins/etc.) +
   AfriScore proprietary scoring (7 sub-scores + composite), unit-tested.
8. ✅ **API layer** — versioned REST (`/api/v1`), 12 endpoints across
   quotes/historical/companies/financials/corporate-actions/movers/sectors/
   research/screener/health.
9. ✅ **Streaming** — WebSocket server with per-symbol subscription, pub/sub
   bridge from ingestion.
10. ✅ **Workers** — price (interval), financials/corporate-actions/candles
    (cron), scheduler orchestrating correct bootstrap order.
11. ✅ **Monitoring** — structured logging (pino), health check endpoint,
    data-quality checks (staleness, price-jump plausibility).
12. ✅ **Docs** — this set.

## What's deliberately NOT built yet (and why)

- **RealNseClient is a scaffold, not a working client.** There is no public,
  free, licensed NSE feed to integrate against. The interface, auth
  pattern, and TODO markers are in place (`adapters/nse/nseClient.ts`) —
  wiring it in once a provider is contracted is a matter of filling in
  endpoint paths, not restructuring anything.
- **Redis cache is a guarded stub**, not a dependency, until you're actually
  running multiple API instances that need to share a hot-quote cache. The
  in-memory driver is the right choice for a single-instance MVP.
- **NGX/JSE/EGX/GSE/BRVM adapters** are placeholder READMEs, per the brief
  ("NSE first, architected for all African exchanges later").
- **Raw-payload archival table** (storing untouched provider responses for
  full audit) — `ingestion_logs` covers outcome-level audit (what ran, how
  many records, what errors) today; add `market.raw_payloads` if/when a
  requirement needs the literal bytes preserved, not just the summary.

## Recommended next steps, in order

1. **Run this against your actual Supabase Postgres** (not the sandbox test
   DB this was verified against) — apply `030_market_schema.sql`, point
   `DATABASE_URL` at it, `npm run dev`.
2. **Point the app at this API** instead of (or alongside) its current
   hardcoded `stockData` in `StockDetail.tsx` and similar files — this is
   the natural next task, and a large one on its own (every screen currently
   reading hardcoded arrays needs to read from `/api/v1/*` instead).
3. **Contract a licensed NSE feed**, then implement `RealNseClient` against
   it and flip `NSE_CLIENT_MODE=live`. Nothing else changes.
4. **Add authentication** to the API layer (currently open) before any
   external API customer access — an API-key or JWT middleware slots into
   `api/middleware/` alongside the existing error handler and request logger.
5. **Move to Redis** for cache once running more than one API instance.
6. **Add the second exchange** (whichever the business prioritizes) using
   `docs/architecture/ADAPTER_PATTERN.md`.

## Verification performed

Not just "it type-checks" — the whole pipeline was run against a real,
locally-installed Postgres instance during this build:

- `npm run typecheck` — clean, zero errors, across all ~70 source files.
- `npm test` (vitest) — 8/8 passing (ratios engine, AfriScore engine, NSE
  mapper including timezone-conversion correctness).
- Applied `030_market_schema.sql` to a real Postgres 16 instance — clean,
  zero errors, 17 tables + indexes.
- Ran the full server (API + WebSocket + all workers) against that
  database end-to-end. This caught two real bugs that type-checking and
  unit tests could not have caught:
  - A company/security insert ordering bug (foreign key violation on
    every single insert) in the fundamentals pipeline.
  - A unit-scale bug in the mock NSE client producing 400x-inflated market
    caps, which cascaded into unrealistic PE ratios.
  Both are fixed in the delivered code; the fixes and their reasoning are
  left as comments at the fix sites.
- Verified via `curl` against the live server: quotes, research
  (ratios + AfriScore for all 17 mock securities, not just one), historical
  candles at multiple resolutions (including aggregated weekly/monthly),
  company profiles, dividends, and the screener — all returning correct,
  internally-consistent data with zero ingestion errors in the audit log.