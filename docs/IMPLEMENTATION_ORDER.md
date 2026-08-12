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
4. ✅ **Ingestion** — collectors (with retry+backoff), zod validators, four
   pipelines (price, fundamentals, corporate actions, candles), dead-letter
   handling on every failure path.
5. ✅ **Normalization** — price rounding/derived-field consistency, canonical
   sectors, balance-sheet integrity checks, corporate-action sanity checks.
6. ✅ **Storage** — Postgres schema (`market`), repositories for every
   entity, cache abstraction (in-memory or Redis, both fully implemented).
7. ✅ **Calculation engine** — ratios engine (PE/PB/ROE/margins/etc.) +
   AfriScore proprietary scoring (7 sub-scores + composite), unit-tested.
8. ✅ **API layer** — versioned REST (`/api/v1`), 12 endpoints, API-key auth,
   per-key rate limiting, zod-validated query params on every route.
9. ✅ **Streaming** — WebSocket server with API-key auth at connection time,
   per-symbol subscription, pub/sub bridge from ingestion.
10. ✅ **Workers** — price (interval, trading-calendar-aware),
    financials/corporate-actions/candles (cron), scheduler orchestrating
    correct bootstrap order.
11. ✅ **Monitoring** — structured logging (pino), health check endpoint
    (including aggregate quote-freshness across the exchange, not just
    per-request), data-quality checks (staleness, price-jump plausibility,
    duplicate candle detection) — all wired in, not just defined.
12. ✅ **Trading calendar** — NSE hours/days/holidays; the price worker's
    recurring poll respects it, bootstrap's seed pass doesn't (needs to
    produce data regardless of deploy time).
13. ✅ **Docker Compose** — one-command local setup (Postgres + backend,
    migrations auto-applied).
14. ✅ **Tests** — 34 tests across 7 files: pure-function unit tests
    (ratios, AfriScore, NSE mapper, normalization, candle aggregation,
    retry logic, trading calendar) plus a self-skipping integration test
    that runs the full pipeline against a real Postgres instance and
    asserts on the actual stored results — codifying the manual
    verification performed during development into something that runs on
    every change instead of only once.
15. ✅ **Docs** — this set.

## What's deliberately NOT built yet (and why)

- **RealNseClient is a scaffold, not a working client.** There is no public,
  free, licensed NSE feed to integrate against. The interface, auth
  pattern, and TODO markers are in place (`adapters/nse/nseClient.ts`) —
  wiring it in once a provider is contracted is a matter of filling in
  endpoint paths, not restructuring anything.
- **NGX/JSE/EGX/GSE/BRVM adapters** are placeholder READMEs, per the brief
  ("NSE first, architected for all African exchanges later").
- **Raw-payload archival table** (storing untouched provider responses for
  full audit) — `ingestion_logs` covers outcome-level audit and
  `dead_letters` covers failed-record audit; add `market.raw_payloads` if/
  when a requirement needs the literal untouched bytes preserved for every
  record, not just failures.
- **Sector-relative AfriScore anchors** — PE/PB/etc. are currently scored
  against one fixed band regardless of sector (a bank's realistic PE range
  differs from a tech company's). Works fine for a first cut across NSE's
  actual sector mix, but is the next real improvement to the scoring model.
- **DCF / intrinsic value / fair value range / margin of safety /
  peer-and-sector comparison endpoints** — mentioned in the original spec,
  not built. A separate, sizeable piece of work on top of the ratios engine
  that exists today.
- **Metrics/observability beyond logs** — no Prometheus/StatsD, no
  dashboards. Structured logs + the health endpoint are what exists;
  wiring those into a metrics backend is straightforward but not done.

## Recommended next steps, in order

1. **Run this against your actual Supabase Postgres** (not the sandbox test
   DB this was verified against) — apply both `030_market_schema.sql` and
   `031_production_readiness.sql`, point `DATABASE_URL` at it, `npm run dev`
   (or `docker compose up`).
2. **Issue real API keys** (`npm run apikey:create`) for the app and any
   other consumer, and remove `DEV_API_KEY` from any non-local environment.
3. **Point the app at this API** instead of (or alongside) its current
   hardcoded `stockData` in `StockDetail.tsx` and similar files — this is
   the natural next task, and a large one on its own (every screen currently
   reading hardcoded arrays needs to read from `/api/v1/*` instead).
4. **Contract a licensed NSE feed**, then implement `RealNseClient` against
   it and flip `NSE_CLIENT_MODE=live`. Nothing else changes.
5. **Move to Redis** (`CACHE_DRIVER=redis`) once running more than one API
   instance — the implementation is complete, just not the default.
6. **Add the second exchange** (whichever the business prioritizes) using
   `docs/architecture/ADAPTER_PATTERN.md`.

## Verification performed

Not just "it type-checks" — the whole pipeline was run against a real,
locally-installed Postgres instance during this build, twice: once for the
initial delivery, and again after the production-readiness pass below.

- `npm run typecheck` — clean, zero errors, across all source files.
- `npm test` (vitest) — **34/34 passing** across 7 files: ratios engine,
  AfriScore engine, NSE mapper, normalization rules, candle aggregation,
  retry/backoff logic, trading calendar, and a self-skipping integration
  test that runs the full pipeline against a real Postgres instance.
- Applied both migrations to a real Postgres 16 instance — clean, zero
  errors, 19 tables + indexes.
- Ran the full server (API + WebSocket + all workers, with auth and rate
  limiting active) against that database end-to-end via `curl`.

This second verification pass caught two more real bugs that only running
the actual code — not type-checking, not reasoning about the code —
surfaced:

- **`node-postgres` returns `numeric`/`bigint` columns as strings by
  default**, not JS numbers. Every price, ratio, market cap, and volume in
  this schema is a `numeric` or `bigint` column, so left unfixed this would
  have silently handed every repository caller strings instead of numbers —
  `pe < 100` comparisons, arithmetic on volumes, all quietly wrong in ways
  that don't throw. Fixed with a global type parser in `storage/db.ts`
  rather than patching each call site, which would have left the same trap
  for the next new query.
- **The candle aggregator's monthly/yearly rollup used fixed-millisecond
  buckets** (`30 * 86400000` for "a month"), which is wrong because months
  aren't a fixed length — it could silently merge two different calendar
  months into one bucket depending on epoch alignment. Fixed with proper
  calendar-based bucketing (grouping by actual UTC year/month) for `1M`/`1y`
  while keeping the fixed-window approach for genuinely fixed-length
  intervals (`1m` through `1w`).

Both were caught by the new automated tests (`tests/candleAggregator.test.ts`
and `tests/integration/pipeline.integration.test.ts`), which is exactly the
gap those tests were added to close — the earlier delivery's manual `curl`
verification wouldn't repeat itself on the next code change; these tests do.