# Frontend ↔ AfriFinance Data Layer Integration

Status as of this integration pass. This is the connection between `app/`
(the React frontend) and `backend/` (the AfriFinance Data Layer) described
in `docs/architecture/ARCHITECTURE.md` and `docs/api/API.md`.

## What changed

### Backend (`backend/`)
One missing endpoint was added — everything else the frontend needed
already existed:

- **`GET /api/v1/instruments?exchange=NSE`** — lists the full tradable
  universe for an exchange (`storage/repositories/securitiesRepository.ts`
  → `listInstruments`, `api/controllers/instruments.controller.ts`,
  `api/routes/instruments.routes.ts`). This exists so the frontend can ask
  the Data Layer "what stocks do you actually have data for" instead of
  relying on a hand-maintained ticker list that drifts out of sync (see
  "Known gap" below — this is exactly the problem it solves).

No other backend files were changed. All 45 existing backend tests still
pass, including the full integration pipeline test against a real Postgres
database.

### Frontend (`app/src/api/`, new)
A clean client layer, matching the structure `docs/architecture/DATA_FLOW.md`
already called for:

| File | Purpose |
|---|---|
| `client.ts` | Base fetch wrapper — API key header, base URL, typed `AfriFinanceApiError` |
| `types.ts` | TS types mirroring the backend's standard schema (`backend/src/types/market.ts`) |
| `quotesApi.ts`, `historicalApi.ts`, `companiesApi.ts`, `financialsApi.ts`, `corporateActionsApi.ts`, `moversApi.ts`, `sectorsApi.ts`, `researchApi.ts`, `screenerApi.ts`, `instrumentsApi.ts` | One thin module per backend resource |
| `websocketClient.ts` | Single shared WebSocket connection with per-symbol ref-counted subscriptions — N components watching SAFCOM share one server subscription, matching `docs/architecture/DATA_FLOW.md`'s "shared real-time data layer" |

### Frontend hooks (`app/src/hooks/`, new)
- `useLiveQuotes` / `useLiveQuote` — the core hook: React Query for the REST
  snapshot + the shared WebSocket for live ticks. Everything else builds on
  this.
- `useInstruments` — real tradable universe, static fallback if the API is
  unreachable.
- `useMovers`, `useResearch`, `useCompanyProfile` — thin wrappers over their
  respective endpoints.

### Frontend hooks/pages rewired to use them
- **`useRealtimePrices` / `useRealtimePrice`** — previously a client-side
  random-walk simulation (its own comment said "replace with actual
  WebSocket/API"). Now backed by the real Data Layer. Same external
  interface, so its one consumer (`RealtimeWatchlistWidget`) needed no
  changes.
- **`Watchlist.tsx`** — live prices via `useLiveQuotes`; "add to watchlist"
  search now lists the real instrument universe via `useInstruments`.
- **`AllStocksList.tsx`** (Markets → All Stocks tab) — live quotes overlaid
  on the static reference list.
- **`Markets.tsx`** — Top Gainers/Losers now come from `GET /movers`
  (server-computed, not re-derived client-side); sector rollups overlay live
  quotes onto the static universe.
- **`StockDetail.tsx`** — quote header (price/change/volume/market cap) is
  live; company description/HQ/CEO/employees/founded come from
  `GET /companies/:symbol` when available; the AfriScore card prefers the
  Data Layer's own calculation (`GET /research/:symbol`) over the client's
  heuristic estimate.
- **`HoldingsList.tsx`** (Portfolio, used by both `TrackInvestments.tsx` and
  the public `UserProfile.tsx`) — position values, day change, and dividend
  income all price off live quotes, so a holding's value can't disagree with
  what Watchlist/Markets/the Stock Page show for the same symbol (the
  "single source of truth" requirement in `docs/architecture/ARCHITECTURE.md`).
- **`StockScreener.tsx`** — price/day-change columns overlay live quotes on
  the existing fundamentals table. The rest of the screener's filtering
  (RSI, volume buckets, market-cap ranges, sliders) stays client-side for
  now — the backend's `/screener` endpoint doesn't carry RSI, and a full
  swap to server-side filtering would drop UI features it doesn't yet
  support; `screenerApi.ts`/`GET /screener` is ready for that as a follow-up.

### Fallback behavior (by design, not an oversight)
Every hook above degrades gracefully instead of erroring or fabricating
data:
- A symbol outside the Data Layer's current universe → falls back to the
  existing static reference price/metadata for that one symbol, with an
  `isLive`/`source` flag threaded through so it's not silently presented as
  live.
- API unreachable entirely → `useInstruments` falls back to the static
  ticker list; other hooks return empty/loading state rather than fake data.

## Known gap: symbol universe mismatch

The backend's mock NSE adapter (`backend/src/adapters/nse/nseClient.ts`)
currently generates data for **17 real NSE tickers**. The frontend's static
reference list (`app/src/lib/stockPrices.ts`) has **~30**. The extra ~13
(e.g. `ARM`, `NBK`, `UMEME`, `CIC`, `KENO`, `WTK`, `KAKZ`, `SASN`, `EGAD`,
`TCL`, `SAMR`, `NSE`, `CARBACID`) aren't in the Data Layer yet, so they keep
showing static reference prices everywhere, flagged internally as
non-live. This wasn't "fixed" by fabricating quotes for them — per the
brief's §26, that would mean inventing financial information. The clean fix
is either narrowing the frontend's list to match the real backend universe,
or adding the remaining companies to the NSE adapter/seed data; both are
mechanical once the real data source (or a wider mock seed) is decided.

## Still on static/mock data (not yet wired this pass)

- **`StockScreener.tsx`** — has a real counterpart at `screenerApi.ts` /
  `GET /screener` for server-side filtering/sorting; price/change columns
  are already live (see above), full server-side filtering not yet wired
  (see rationale above).
- **`StockDetail.tsx` price chart** — real daily candles from
  `GET /historical/:symbol` for every timeframe except "1D" (the backend
  only backfills daily bars — see `useHistoricalCandles.tsx` — so a 1-day
  chart stays on the generated series until the Data Layer has an intraday
  candle source). `StockPriceChart` takes an optional `data` prop for this;
  omit it and the component still works standalone off its own mock
  generator, unchanged.
- **`StockDetail.tsx` research tabs** — the AfriScore card and Valuation/
  Growth/Health/Dividends/Ownership/Risk/Performance tabs all read one
  shared `fundamentals` object (`Fundamentals` type,
  `app/src/data/stockFundamentals.ts`). Rather than rewrite each tab, a
  `liveFundamentals` overlay in `StockDetail.tsx` merges real data onto
  specific fields of that same object: `dividendHistory` (from
  `useDividendHistory.tsx` → `/dividends/:symbol`, interim+final payouts
  summed per year), `payoutRatio` (from `/research/:symbol`), `ownership` /
  `topShareholders` (from `useOwnership.tsx` → `/ownership/:symbol`).
  Fields the backend has no data source for yet — analyst price targets,
  insider trades, revenue segments/geographic split, Piotroski F-Score,
  Altman Z-Score, EPS-estimate drift, earnings surprises, full multi-year
  ROE/ROA/ROIC and margin *history* (the backend's `/research/:symbol`
  gives current ratios, not a time series) — are deliberately left on the
  synthetic generator rather than fabricated. `docs/architecture/ARCHITECTURE.md`
  names Piotroski/Altman Z as part of the intended RESEARCH surface, so
  those two are the most natural next backend additions if this gets
  picked up further.
- **`StockCompare.tsx`**, **`Discover.tsx`**, **`Home.tsx`**'s smaller
  widgets (`CommandCenterSections`, `QuickTradeWidget`, `StockHeatmap`),
  **`SectorDetail.tsx`**, **`SectorHeatmap.tsx`**, **`ThemeDetail.tsx`**,
  **`FeaturedListDetail.tsx`** — still read `lib/stockPrices.ts` directly.
- Indices (NSE 20/25, NASI), commodities, IPO/economic-calendar entries in
  `Markets.tsx` — the Data Layer doesn't have index/commodity/calendar data
  sources built yet; these remain illustrative placeholders until that's
  added upstream, not something the frontend integration layer can fix on
  its own.

None of the above were silently left as mock — they're listed here
precisely so the gap is visible rather than assumed away.

## Verified this pass

- Stood up a real local Postgres 16, applied `supabase/migrations/030_market_schema.sql`
  and `031_production_readiness.sql` cleanly.
- **45/45 backend tests pass**, including the full pipeline integration test
  against that real database.
- Booted the full backend (REST API :4000, WebSocket :4001, ingestion/
  calculation workers) and exercised it directly: `/health`, auth
  enforcement, `/quotes`, `/movers`, `/research`, `/screener`, `/financials`,
  `/sectors`, the new `/instruments`, and a 404 for an unknown symbol.
- Frontend: clean `tsc --noEmit` against `tsconfig.app.json`, clean
  production `vite build`, and headless-browser (Playwright) runs against
  the live dev server + live backend confirming the actual network calls:
  `GET /instruments`, `GET /movers`, `GET /quotes` (batch, all 30 canonical
  symbols), `GET /companies/SAFCOM`, `GET /quotes?symbols=SAFCOM`,
  `GET /research/SAFCOM`, `GET /dividends/SAFCOM`, `GET /ownership/SAFCOM`,
  and `GET /historical/SAFCOM` (fired on switching the chart to the "1Y"
  timeframe pill) — all returning `200`.
- (That Playwright run temporarily bypassed the Supabase auth guard
  in-memory to reach the routes without a login flow; the real
  `ProtectedRoute.tsx` was restored immediately after and is unchanged in
  the final diff.)

## Environment variables (new)

Added to `app/.env`:

```
VITE_AFRIFINANCE_API_URL="http://localhost:4000/api/v1"
VITE_AFRIFINANCE_WS_URL="ws://localhost:4001"
VITE_AFRIFINANCE_API_KEY="dev-local-only-key"   # matches backend's DEV_API_KEY
```

**Production note:** `VITE_AFRIFINANCE_API_KEY` is a first-party key for
AfriFinance's own backend (not an upstream NSE credential), but Vite still
ships it in browser JS. Fine for local dev; before shipping to real users,
replace `getApiKey()` in `app/src/api/client.ts` (and the matching spot in
`websocketClient.ts`) with a short-lived token fetched from an authenticated
endpoint — e.g. a Supabase Edge Function that holds the real key
server-side and mints a scoped, per-user, expiring token. Nothing else
needs to change.

## Running it locally

```bash
# 1. Database (once)
createdb afrifinance
psql -d afrifinance -f supabase/migrations/030_market_schema.sql
psql -d afrifinance -f supabase/migrations/031_production_readiness.sql

# 2. Backend
cd backend
cp .env.example .env   # set DATABASE_URL, DEV_API_KEY, etc. — see backend/README.md
npm install
npm run dev             # API on :4000, WS on :4001

# 3. Frontend
cd app
npm install
npm run dev              # picks up VITE_AFRIFINANCE_* from app/.env
```