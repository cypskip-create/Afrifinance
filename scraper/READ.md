# Continua Scraper (Web Intelligence / Data Ingestion Engine)

**Phase 0 of a multi-phase build.** This delivery is the foundation only —
service scaffold + database schema. There is no crawler yet.

## What's actually built right now

- Standalone Node/TypeScript service (`continua-scraper`), separate from
  `continua-data` (`backend/`) so heavy crawl/PDF/OCR work never competes
  with the live price/WebSocket process for memory or CPU.
- `scraping` Postgres schema (same instance as `market`/`public`):
  - `scraping.sources` — declarative source config + required licensing
    metadata (terms/robots/license/redistribution).
  - `scraping.crawl_state` — per-URL crawl status, for incremental crawls.
  - `scraping.raw_artifacts` + `scraping.artifact_urls` — deduplicated
    downloaded content, keyed by content hash, with every URL it was ever
    found at.
  - `scraping.extractions` — output of processing an artifact (text/tables/
    OCR), versioned so a document can be reprocessed by a newer parser
    without re-downloading.
  - `scraping.dead_letters` — permanently failed jobs with a reason.
- `GET /health` — checks DB connectivity.
- `GET /sources` — lists enabled sources (empty until Phase 1, when the
  NSE/generic source configs get seeded via `upsertSource`).
- `npx tsc --noEmit -p tsconfig.json` and `npm run build` both verified
  passing.

## What's explicitly NOT built yet (next phases)

- The crawler itself — no HTTP fetching, no link discovery, no content-type
  detection, nothing in `scraping.crawl_state` gets populated by anything
  yet.
- PDF discovery/extraction, table extraction, OCR.
- The NSE adapter (or any adapter).
- Playwright browser worker.
- Rate limiting / retry-backoff / scheduling (config columns exist on
  `sources`, nothing reads them yet).
- Raw artifact file storage (the `RAW_STORAGE_DRIVER` env var exists,
  nothing writes to disk or Supabase Storage yet).

## Local setup

```bash
cp .env.example .env
# point DATABASE_URL at the same Postgres continua-data uses locally
npm install
npm run dev
```

Apply `supabase/migrations/20260827090000 scraping engine foundation schema.sql`
in the Supabase SQL Editor before starting the service — same manual-apply
convention as every other Continua migration.

## Next step

Phase 1: generic HTTP crawler — fetch, link discovery (`<a>`, `<iframe>`,
sitemap.xml), content-type detection, hashing/dedup against
`crawl_state`/`raw_artifacts`, and generic HTML metadata extraction
(title, OpenGraph, JSON-LD). No PDFs, no adapters, no NSE-specific logic
yet — just prove the crawl loop and the storage layer work end to end on
a real page.