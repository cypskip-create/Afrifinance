# Continua Data — Architecture

## What this is

Continua Data is the single source of truth for African market data across
the Continua product: the app, stock pages, research tools, charts,
TradersHub widgets, Media pages, screeners, and (later) external API
customers. It is NSE-only today, built so every other African exchange
(NGX, JSE, EGX, GSE, BRVM, ...) can be added later as a new adapter without
touching anything else in the system.

It is a **modular financial data engine**, not a thin app backend: adapters
translate provider data, ingestion collects and orchestrates, normalization
enforces cross-exchange consistency, validation rejects bad data before it's
stored, storage persists live/historical/fundamental data, a calculation
engine derives ratios and Continua's proprietary scores, and an API +
WebSocket layer serves all of it to clients.

## Layers

```
+-----------------------------------------------------------------------+
|  Exchange (licensed feed / mock)                                      |
+------------------------------------+----------------------------------+
                                      | raw, provider-specific shapes
+------------------------------------v----------------------------------+
|  ADAPTER LAYER            backend/src/adapters/nse/                   |
|  Client (transport) -> Mapper (translation) -> Adapter (orchestration)|
|  Output: Continua Standard Schema (types/market.ts)                |
+------------------------------------+----------------------------------+
                                      | standard schema, per-exchange values
+------------------------------------v----------------------------------+
|  INGESTION LAYER          backend/src/ingestion/                      |
|  Collectors (ask adapter) -> Pipelines (orchestrate) -> Validators    |
+------------------------------------+----------------------------------+
                                      |
+------------------------------------v----------------------------------+
|  NORMALIZATION LAYER      backend/src/normalization/                  |
|  Exchange-agnostic cleanup rules (rounding, derived-field             |
|  consistency, canonical sectors, balance-sheet integrity checks)      |
+------------------------------------+----------------------------------+
                                      | clean, validated, standard-shape data
+------------------------------------v----------------------------------+
|  STORAGE LAYER            backend/src/storage/                        |
|  Postgres (`market` schema) via repositories + in-memory/Redis cache  |
+------------------------------------+----------------------------------+
                                      |
+------------------------------------v----------------------------------+
|  CALCULATION LAYER        backend/src/services/research/              |
|  Ratios engine (PE, ROE, margins, ...) + AfriScore proprietary        |
|  scoring (AfriValue, AfriGrowth, AfriHealth, AfriIncome, AfriRisk,    |
|  AfriQuality, AfriMomentum, composite AfriScore)                      |
+------------------------------------+----------------------------------+
                                      |
              +-----------------------+-----------------------+
+-------------v--------------+                  +--------------v-------------+
|  API LAYER                 |                  |  STREAMING LAYER           |
|  backend/src/api/          |                  |  backend/src/streaming/    |
|  REST, versioned /api/v1   |                  |  WebSocket, pub/sub        |
+-------------+--------------+                  +--------------+-------------+
              |                                                 |
              +----------------------+--------------------------+
                                      |
                  App . Website . TradersHub . Media . Screener
```

A ninth layer, **monitoring** (`backend/src/monitoring/`), runs alongside
every other layer rather than beneath them: structured logging, health
checks, and data-quality checks (staleness, price-jump plausibility,
duplicate detection).

## Why this shape

- **The app never talks to a data provider directly.** It talks to
  Continua Data's API. The provider (NSE today) is fully hidden behind
  the adapter boundary — swap it, add auth, change endpoints, none of that
  is visible past `adapters/nse/`.
- **Every exchange speaks the same internal language.** `types/market.ts`
  is the one schema the rest of the system understands. NSE's mapper
  translates NSE's shapes into it; NGX's mapper (when built) will do the
  same for NGX's shapes. Ingestion, storage, calculation, and the API only
  ever see the standard schema.
- **Validation and normalization are separate concerns on purpose.**
  Normalization asks "is this internally consistent, rounded, and
  canonical?" (a business-rule question). Validation asks "is this
  well-formed enough to store?" (a shape question). Splitting them means a
  bad NSE feed can't corrupt a chart, and a rule change (e.g. a new
  canonical sector) doesn't need touching the validation schemas.
- **One process today, split-ready tomorrow.** The API, WebSocket server,
  and background workers currently run in one Node process. They share two
  things: the pub/sub event bus (`streaming/pubsub.ts`, an `EventEmitter`)
  and the cache (`storage/cache.ts`). Both have a documented path to a
  shared backend (Redis) — see the file comments — for the day this needs
  to split into separate deployables.

## Where this lives in the repo

```
AFRIFINANCE/
├── app/            ← the existing Lovable/React app (unchanged by this work)
├── backend/         ← Continua Data — everything described in this doc
├── supabase/
│   └── migrations/
│       └── 030_market_schema.sql   ← this layer's DB schema (see docs/data-model)
└── docs/            ← you are here
```

Continua Data writes into the **same Postgres instance** the app already
uses via Supabase, but in its own `market` schema (not `public`). One
project, one connection string, a clean boundary via schema separation
rather than a second database to keep in sync.