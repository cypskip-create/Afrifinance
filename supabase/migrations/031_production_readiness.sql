-- ═══════════════════════════════════════════════════════════════════════
-- Continua Data — production-readiness additions
-- ═══════════════════════════════════════════════════════════════════════
-- Adds: dead-letter storage for failed ingestion records, and API keys for
-- authenticating requests to the API layer (internal app + future external
-- customers, per the original spec).
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS market.dead_letters (
  id           bigserial PRIMARY KEY,
  exchange     text NOT NULL,
  dataset      text NOT NULL CHECK (dataset IN ('price','candle','financials','corporate_action','earnings','ownership')),
  symbol       text,
  payload      jsonb NOT NULL,
  error        text NOT NULL,
  occurred_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_dead_letters_recent ON market.dead_letters(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_dead_letters_dataset ON market.dead_letters(dataset, occurred_at DESC);

-- Keys are stored as a SHA-256 hash, never the plaintext value — the
-- plaintext is shown to the caller exactly once, at creation time (see
-- scripts/generateApiKey.ts), matching normal API-key hygiene.
CREATE TABLE IF NOT EXISTS market.api_keys (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_hash           text NOT NULL UNIQUE,
  name               text NOT NULL,
  active             boolean NOT NULL DEFAULT true,
  rate_limit_per_min integer NOT NULL DEFAULT 120,
  created_at         timestamptz NOT NULL DEFAULT now(),
  last_used_at       timestamptz
);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON market.api_keys(key_hash) WHERE active = true;